const uuidv4 = require('uuid/v4');

class Logger {
  static integrations = [];
  static allowDebugLogs;
  static processId;
  static service;
  static env;

  static init(env, service, allowDebugLogs, isRunningLocal, processId = null, getContextFunc = null, instanceId) {
    if (this.env) return;
    this.env = env.toLowerCase();
    this.processId = processId || uuidv4();
    this.instanceId = instanceId;
    this.allowDebugLogs = allowDebugLogs;
    this.isRunningLocal = isRunningLocal;
    this.getContextFunc = getContextFunc || (() => {});
    this.service = service;
    this.integrations = [];
    this.supportedLevels = new Set(['critical', 'error', 'info', 'debug', 'warn', 'verbose']);
  }

  static registerIntegration(integration) {
    this.integrations.push(integration);
  }

  static writeLog(level, message, extraInfo = {}) {
    if (!this.env) return;
    if (extraInfo?.debugLog && this.allowDebugLogs === false) return;

    if (!this.supportedLevels.has(level)) level = 'error';

    let [extraInfoError] = [extraInfo.error];
    delete extraInfo.req
    delete extraInfo.error;

    let logObject = {
      ...this.extractErrorData(extraInfoError, message),
      ...extraInfo,
      level: level,
      message: message.toString(),
      env: this.env,
      service: this.service,
      processId: this.processId,
      instanceId: this.instanceId,
      version: 'v2',
    };

    delete logObject.req;

    this.shipIntegrations(logObject, extraInfo);
    this.shipLocal(logObject, extraInfo);
  }

  static extractErrorData(error, logMessage) {
    if (!error) return {};
    let errorInfo = { message: error.message || error.name || error.code || logMessage, stack: error.stack };
    try {
      if (error.code) errorInfo.code = error.code;
      if (error.request?.url) errorInfo.requestUrl = error.request.url;
      if (error.response?.status) errorInfo.responseStatus = error.response?.status;
      if (error.response?.data) errorInfo.responseData = JSON.stringify(error.response.data);
      if (error.metadata) errorInfo.metadata = JSON.stringify(error.metadata);
    } catch (e) {}
    return { error: errorInfo};
  }

  static shipIntegrations(logObject, extraInfo) {
    if (!this.isRunningLocal && this.env != 'dev') {
      this.integrations.map(integration => {
        try {
          integration.shipLog(logObject, extraInfo);
        } catch (err) {
          logObject.level == 'error' ? console.error(JSON.stringify(logObject)) : console.log(JSON.stringify(logObject));
          console.error('Error to ship logger!', err);
        }
      });
    }
  }

  static shipLocal(logObject = {}) {
    if (this.isRunningLocal) {
      let consoleLog = logObject.level == 'error' ? console.error : console.log;
      let omitFields = new Set(['message', 'env', 'version', 'processId', 'service', 'timestamp', 'level']);
      let extraData = Object.entries(logObject).filter(([k, v]) => !omitFields.has(k) && v !== undefined);
      consoleLog(`%c${this.env.toUpperCase()} %c${logObject.level}: ${logObject.message} %c${logObject.error?.stack ? `\n${logObject.error.stack}` : extraData.map(([k, v]) => `${k}:${JSON.stringify(v)}`).join(', ')}`, 'color:#CB46A8', 'color:#C2FF9D', '#color:AAC1F2'); // 'color:#FFD700');
    }
  }

  static info(message, extraInfo) {
    Logger.writeLog('info', message, extraInfo);
  }

  static error(message, extraInfo) {
    Logger.writeLog('error', message, extraInfo);
  }

  static debug(message, extraInfo) {
    Logger.writeLog('debug', message, extraInfo);
  }

  static warn(message, extraInfo) {
    Logger.writeLog('warn', message, extraInfo);
  }

  static verbose(message, extraInfo) {
    Logger.writeLog('verbose', message, extraInfo);
  }

  static critical(message, extraInfo) {
    Logger.writeLog('critical', message, extraInfo);
  }
}

module.exports = Logger;
