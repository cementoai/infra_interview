const IssueMapper = require('../mappers/issueMapper');
const IssueSchema = require('../schemas/issueSchema');
const BaseRepository = require('../../../../common/baseRepository');

class IssuesRepository extends BaseRepository {
  constructor() {
    super(IssueSchema, IssueMapper);
  }

  _filtersToQuery(filters) {
    const { ids } = filters;

    return {
      ...(ids && { id: { $in: ids } }),
    };
  }
}

module.exports = IssuesRepository;
