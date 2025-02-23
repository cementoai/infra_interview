const _ = require('lodash');
const Joi = require('joi');
const Logger = require('../../../common/logger');
const Errors = require('../../../common/errors');

const whitelistErrorsArray = [Errors.UnauthorizedError];
const serverErrorsArray = Object.values(Errors).filter(error => typeof error === 'function');

function isWhiteError(err) {
  return whitelistErrorsArray.some(whiteError => err instanceof whiteError);
}

function isServerError(err) {
  return serverErrorsArray.some(serverError => err instanceof serverError || (err.name && err.name === serverError.prototype.constructor.name));
}

function setJoiValidationErrorCode(err) {
  if (err instanceof Joi.ValidationError) err.code = Errors.statuses.BAD_REQUEST;
}

function isServerTimeout(err) {
  if (err.code === 'ETIMEDOUT' || err.code === Errors.statuses.TIMEOUT) {
    err.code = Errors.statuses.TIMEOUT;
    return true;
  }
  return false;
}

function errorMiddleware(err, req, res, next) {
  setJoiValidationErrorCode(err);

  if (isWhiteError(err)) Logger.warn(err.message, { req });
  else if (isServerTimeout(err)) Logger.error('current operation exceeded time limit', { req, error: err });
  else if (isServerError(err)) Logger.error(getErrorMessage(err), { req, error: err });
  else Logger.error('express errors middleware: unhandled error - ' + getErrorMessage(err), { req, error: err });

  const status = _.isNumber(err?.code) ? err.code : Errors.statuses.SERVER_ERROR;

  res.status(status).send({
    message: getErrorMessage(err, 'error handling middleware'),
    errors: err.requestErrors
  });

  if (next) next(err);
}

const getErrorMessage = (err, defaultMessage = null) => {
  return err.name && err.message ? `${err.name || ''}: ${err.message || ''}` : err.name || err.message || defaultMessage;
};

const errorsWrapper = function (handler) {
  return async function (req, res, next) {
    try {
      let ret = await handler(req, res, () => {});
      if (next) next();
      return ret;
    } catch (err) {
      if (next) next(err);
      else throw err;
    }
  };
};

module.exports = {
  errorMiddleware,
  errorsWrapper
};
