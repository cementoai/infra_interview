const _ = require('lodash');
const Errors = require('../../../common/errors');

const USER_NOT_AUTHORIZED_IN_SCOPE = 'User is not authorized in this scope';
const NO_AUTH_HEADER = 'No authorization header';
const INVALID_TOKEN_SIGNATURE = 'Invalid token signature';
const TOKEN_REQUIRED_FIELDS_MISSING = 'Token required fields are missing';
const TOKEN_EXPIRED = 'Token is expired';
const TOKEN_INIT = 'Token init time is in the future';
const HASH_MISMATCH = 'Hash Mismatch';
const AUTH_PREFIX_MISMATCH = 'Auth Prefix mismatch';
const AUTHENTICATION_ERROR = 'Authentication Error';
const DEFAULT_VERIFICATION_ERR_TYPE = 'Invalid token';
const JWT_CLOCK_TOLERANCE = 1000 * 60 * 2;


async function authMiddleware(req, res, next) {
  const { path, method, headers, connection } = req;
  const { authorization, origin } = headers || {};

  if (method === 'OPTIONS') return next();
  if (isPublicRoute(path)) return next();

  const timeNow = Date.now() / 1000;
  const senderIP = connection.remoteAddress;

  let authPayload = null;

  let release = headers?.['cemento-release'];
  let requester = headers?.requester || req?.query?.requester;
  let logExtraData = { origin, senderIP, requester, req, release };

  try {
    const [authBearer, authToken] = (authorization || 'Bearer ').split(' ');

    if (authBearer != 'Bearer') throw new Error(AUTH_PREFIX_MISMATCH);
    else {
      try {
        authPayload = await verifyToken(authToken);
      } catch (error) {
        const verificationErrType = error?.message ? _.upperFirst(error.message) : DEFAULT_VERIFICATION_ERR_TYPE;
        throw new Error(verificationErrType);
      }

      logExtraData.authPayload = authPayload;

      const userId = authPayload?.userId;

      let isAuthorized = isUserAuthorizedToScope(req, userId);
      if (!isAuthorized) throw new Error(USER_NOT_AUTHORIZED_IN_SCOPE);

      if (!authPayload) {
        logExtraData.extraInfo = 'No authPayload';
        throw new Error(INVALID_TOKEN_SIGNATURE);
      }

      if (!authPayload.exp || !authPayload.iat || !userId) {
        throw new Error(TOKEN_REQUIRED_FIELDS_MISSING);
      }

      if (authPayload.exp < timeNow) {
        logExtraData.timeNow = timeNow;
        throw new Error(TOKEN_EXPIRED);
      }

      if (authPayload.iat > timeNow + JWT_CLOCK_TOLERANCE) {
        logExtraData.timeNow = timeNow;
        throw new Error(TOKEN_INIT);
      }

      if (hashRequired(userId) && !hashValid(req)) {
        logExtraData.body = req.body;
        throw new Error(HASH_MISMATCH);
      }

      return next();
    }
  } catch (error) {
    return next(new Errors.ServerError('something went wrong... how can we solve it?'));
  }
}

async function verifyToken(authToken) {
  if (authToken !== 'this_is_a_valid_token_use_it') {
    throw new Error(INVALID_TOKEN_SIGNATURE);
  }
  return { userId: 'some_user_id', exp: (Date.now() * 2) / 1000, iat: (Date.now() / 2) / 1000 };
}

function hashRequired(sub) {
  return false;
}

function isPublicRoute(path) {
  return false;
}

function hashValid(req) {
  return true;
}

function isGlobalRoute(req) {
  return false;
}

function isAuthorizedToGlobalRoute(req, userId) {
  let isGlobal = isGlobalRoute(req);
  if (!isGlobal) return true;

  let isAuthorized = true;
  return isAuthorized;
}

function isAuthorizedToCompanies(req, userId, companyIds) {
  let isAuthorized = true;
  return isAuthorized;
}

function isAuthorizedToProjects(req, userId, projectIds) {
  let isAuthorized = true;
  return isAuthorized;
}

function isUserAuthorizedToScope(req, userId) {
  if (!isAuthorizedToGlobalRoute(req, userId)) return false;
  const { companies, projects } = extractScopeIds(req);
  return isAuthorizedToCompanies(req, userId, companies) || isAuthorizedToProjects(req, userId, projects);
}

function extractScopeIds(req) {
  return { companies: [], projects: [] };
}

module.exports = {
  authMiddleware
};
