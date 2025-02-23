/* eslint-disable no-unused-vars */
const Errors = require('./errors');

class BaseMapper {
  static toDBObject(object) {
    throw new Errors.NotImplementedError();
  }

  static toResponse(object, clientVersion) {
    throw new Errors.NotImplementedError();
  }
}

module.exports = BaseMapper;
