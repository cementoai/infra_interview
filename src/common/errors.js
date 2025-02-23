const _ = require('lodash');

class BadRequestError extends Error {
  constructor(...args) {
    super();
    this.name = 'BadRequestError';
    this.requestErrors = args;
    this.code = statuses.BAD_REQUEST;
  }
}

class MissingParamError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'MissingParamError';
    this.code = statuses.BAD_REQUEST;
  }

  /**
   * @private
   * @param {[string]} constructorArgs
   */
  _getErrorMessage(constructorArgs) {
    const [paramName] = constructorArgs;
    if (paramName) return `The param "${paramName}" is missing"`;
    else return `A mandatory param is missing`;
  }
}

class InvalidParamError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'InvalidParamError';
    this.code = statuses.BAD_REQUEST;
  }

  /**
   * @private
   * @param {[string, any, string]} constructorArgs
   */
  _getErrorMessage(constructorArgs) {
    const [paramName, expected, actual] = constructorArgs;
    if (paramName && !_.isNil(expected)) return `Invalid param "${paramName}" used. Expected "${expected}", got "${actual}"`;
    else return `Invalid param used.`;
  }
}

class UnauthorizedError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'UnauthorizedError';
    this.code = statuses.UNAUTHORIZED;
  }
}

class ForbiddenError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ForbiddenError';
    this.code = statuses.FORBIDDEN;
  }
}

class NotFoundError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'NotFoundError';
    this.code = statuses.NOT_FOUND;
  }
}

class NotAcceptableError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'NotAcceptableError';
    this.code = statuses.NOT_ACCEPTABLE;
  }
}

class TooManyRequestsError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'TooManyRequestsError';
    this.code = statuses.TOO_MANY_REQUESTS;
  }
}

class ServerError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ServerError';
    this.code = statuses.SERVER_ERROR;
  }
}

class ConflictError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ConflictError';
    this.code = statuses.CONFLICT;
  }
}

class NotImplementedError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'NotImplementedError';
    this.code = statuses.NOT_IMPLEMENTED;
  }
}

class ServiceUnavailableError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ServiceUnavailableError';
    this.code = statuses.SERVICE_UNAVAILABLE;
  }
}

class HookError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = 'HookError';
  }
}

const statuses = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	NOT_ACCEPTABLE: 406,
	TIMEOUT: 408,
	CONFLICT: 409,
	TOO_MANY_REQUESTS: 429,
	SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	SERVICE_UNAVAILABLE: 503,
}

module.exports = {
  MissingParamError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  NotAcceptableError,
  TooManyRequestsError,
  ServerError,
  ConflictError,
  NotImplementedError,
  ServiceUnavailableError,
  InvalidParamError,
  BadRequestError,
  HookError,
	statuses
};
