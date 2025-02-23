const CommentMapper = require('../mappers/commentMapper');
const CommentSchema = require('../schemas/commentSchema');
const BaseRepository = require('../../../../common/baseRepository');

class CommentsRepository extends BaseRepository {
  constructor() {
    super(CommentSchema, CommentMapper);
  }

  _filtersToQuery(filters) {
    const { ids } = filters;

    return {
      ...(ids && { id: { $in: ids } }),
    };
  }
}

module.exports = CommentsRepository;
