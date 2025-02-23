const AsyncEvent = require('../../../../common/asyncEvent');

class IssueCreatedEvent extends AsyncEvent {
  static topic = 'issues.created';

  constructor({ issueId, assignToId }) {
    super();
    this.issueId = issueId;
    this.assignToId = assignToId;
  }
}

module.exports = IssueCreatedEvent;
