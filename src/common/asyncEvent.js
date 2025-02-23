const Logger = require('./logger');

class AsyncEvent {
	static topic;

	getTopic() {
		return this.constructor.topic;
	}

	getDataContext() {
		return {};
	}
	
  publish() {
		const Consumer = require('./consumer');
		Logger.info(`'${this.getTopic()} published`);
    return Consumer.executeLocalHandlers(this);
  }
}

module.exports = AsyncEvent;
