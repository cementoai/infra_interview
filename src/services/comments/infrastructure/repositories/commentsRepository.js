const CommentMapper = require('../mappers/commentMapper');
const CommentSchema = require('../schemas/commentSchema');
const BaseRepository = require('../../../../common/baseRepository');

class CommentsRepository extends BaseRepository {
  constructor() {
    super(CommentSchema, CommentMapper);
  }

  _filtersToQuery(filters) {
    const { parentId } = filters;

    return {
      ...(parentId && { parentId }),
    };
  }
}

module.exports = CommentsRepository;
