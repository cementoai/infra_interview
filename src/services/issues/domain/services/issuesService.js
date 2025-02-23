const SDK = require('../../../_sdk');
const IssuesRepository = require('../../infrastructure/repositories/issuesRepository');
const BaseService = require('../../../../common/baseService');
const IssueUpsertedEvent = require('../../sdk/events/issueUpserted');

class IssuesService {
  constructor() {
    this.base = new BaseService(new IssuesRepository());
  }

  async getById({ id, withComments }, options) {
    const issue = await this.base.getById(id, options);
    if (withComments) await this._enrichComments(issue);
    return issue;
  }

  async getList({ ids, withComments }, options) {
    const issues = await this.base.getList({ ids }, options);
    if (withComments) await Promise.all(issues.map(this._enrichComments));
    return issues;
  }

  async upsert(model) {
    let upsertedIssue = await this.base.upsert(model);
    await new IssueUpsertedEvent({ issueId: upsertedIssue.id, ownerId: upsertedIssue.owner?.id }).publish();
    return upsertedIssue;
  }

  async _enrichComments(issue) {
    const comments = await SDK.comments.getComments({ parentId: issue.id });
    issue.comments = comments;
  }
}

module.exports = IssuesService;
