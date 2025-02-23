const uuidv4 = require('uuid/v4');
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
		const messageId = 'message_id_' + uuidv4();
		Logger.info(`'${this.getTopic()} published - messageId: ${messageId}`);
    setTimeout(() => Consumer.executeLocalHandlers(this), 1);
		return messageId;
  }
}

module.exports = AsyncEvent;
