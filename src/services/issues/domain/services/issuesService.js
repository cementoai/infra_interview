const _ = require('lodash');
const IssuesRepository = require('../../infrastructure/repositories/issuesRepository');
const BaseService = require('../../../../common/baseService');

class IssuesService {
  constructor() {
    this.base = new BaseService(new IssuesRepository());
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

module.exports = IssuesService;
