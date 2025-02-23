const AsyncEvent = require('../../../../common/asyncEvent');

class IssueUpsertedEvent extends AsyncEvent {
  static topic = 'issues.upserted';

  constructor({ issueId, ownerId }) {
    super();
    this.issueId = issueId;
    this.ownerId = ownerId;
  }
}

module.exports = IssueUpsertedEvent;
