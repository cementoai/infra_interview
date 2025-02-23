const CommentsRepository = require('../../infrastructure/repositories/commentsRepository');
const BaseService = require('../../../../common/baseService');

class CommentsService {
  constructor() {
    this.base = new BaseService(new CommentsRepository());
  }

  async getById(id, options) {
    return await this.base.getById(id, options);
  }

  async getList({ ids }, options) {
    return await this.base.getList({ ids }, options);
  }

  async upsert(model) {
    return await this.base.upsert(model);
  }
}

module.exports = CommentsService;
