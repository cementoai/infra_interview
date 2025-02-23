const Consumer = require('./consumer');

class AsyncEvent {
	static topic;

	getTopic() {
		return this.constructor.topic;
	}

	getDataContext() {
		return {};
	}
	
  publish() {
    return Consumer.executeLocalHandlers(this);
  }
}

module.exports = AsyncEvent;
