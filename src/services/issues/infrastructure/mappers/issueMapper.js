const { getId } = require('../../../../common/utils');
const IssueSchema = require('../schemas/issueSchema');
const IssueResponse = require('../../sdk/dtos/issueResponse');
const BaseMapper = require('../../../../common/baseMapper');

class IssueMapper extends BaseMapper {
  static toDBObject(object) {
    return IssueSchema.map({
      ...object,
      id: object.id || getId(),
    });
  }

  static toResponse(object, clientVersion) {
    return new IssueResponse(object);
  }
}

module.exports = IssueMapper;
