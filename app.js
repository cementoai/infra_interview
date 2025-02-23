const loaders = require('./src/loaders');
const Logger = require('./src/common/logger');

process.on('uncaughtException', error => {
  Logger.error('An uncaughtException occur.', { error });
});

process.on('unhandledRejection', (error, promise) => {
  Logger.error('An unhandledRejection! promise rejection was not handled.', { error });
});

async function startServer() {
  await loaders.init();
};

startServer();
