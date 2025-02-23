const { getId } = require('../../../../common/utils');
const CommentSchema = require('../schemas/commentSchema');
const CommentResponse = require('../../sdk/dtos/commentResponse');
const BaseMapper = require('../../../../common/baseMapper');

class CommentMapper extends BaseMapper {
  static toDBObject(object) {
    return CommentSchema.map({
      ...object,
      id: object.id || getId(),
    });
  }

  static toResponse(object, clientVersion) {
    return new CommentResponse(object);
  }
}

module.exports = CommentMapper;
