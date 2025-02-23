const CommentsRepository = require('../../infrastructure/repositories/commentsRepository');
const BaseService = require('../../../../common/baseService');

class CommentsService {
  constructor() {
    this.base = new BaseService(new CommentsRepository());
  }

  async getList({ parentId }, options) {
    return await this.base.getList({ parentId }, options);
  }

  async create(model) {
    return await this.base.create(model);
  }
}

module.exports = CommentsService;
