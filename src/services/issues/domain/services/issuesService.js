const IssuesRepository = require('../../infrastructure/repositories/issuesRepository');
const BaseService = require('../../../../common/baseService');
const IssueUpsertedEvent = require('../../sdk/events/issueUpserted');

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
    let upsertedIssue = await this.base.upsert(model);
    await new IssueUpsertedEvent({ id: upsertedIssue.id, ownerId: upsertedIssue.owner?.id }).publish();
  }
}

module.exports = IssuesService;
