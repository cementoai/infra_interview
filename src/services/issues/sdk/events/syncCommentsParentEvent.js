const BaseAsyncEvent = require('@cemento/network/src/events/asyncEvent');

class SyncCommentParentEvent extends BaseAsyncEvent {
  static topic = 'comments.parent.sync';

  constructor({ parentId, parentType }) {
    super();
    this.parentId = parentId;
    this.parentType = parentType;
  }
}

module.exports = SyncCommentParentEvent;
