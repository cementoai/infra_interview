const AsyncEvent = require('../../../../common/asyncEvent');

class IssueUpsertedEvent extends AsyncEvent {
  static topic = 'issues.upserted';

  constructor({ id, ownerId }) {
    super();
    this.id = id;
    this.ownerId = ownerId;
  }
}

module.exports = IssueUpsertedEvent;
