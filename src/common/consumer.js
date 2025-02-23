const Logger = require('./logger');


class Consumer {
  static handlers = {};

  static async register({ 
    topic, 
    handler, 
  }) {
    Logger.info(`Running in local mode, registering handler for topic "${topic}" directly.`);
    if (!handlers[topic]) handlers[topic] = [];
    this.handlers[topic].push(handler);
    return;
  }

  static async executeLocalHandlers(asyncEvent) {
    let topic = asyncEvent.getTopic();
    let handlers = this.handlers[topic];

    if (!handlers?.length) {
      Logger.info(`[LOCAL MODE] trying to publish '${topic}' event but no handler was registered`)
      return;
    }
      
    await Promise.all(handlers.map(handler => handler(asyncEvent)));
  }
}

module.exports = Consumer;
