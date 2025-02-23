const zlib = require('zlib');
const bodyParser = require('body-parser');
const compression = require('compression');
const timeout = require('connect-timeout');
const responseTime = require('response-time');
const { authMiddleware } = require('./express/middlewares/authMiddleware');
const { errorMiddleware } = require('./express/middlewares/errorsMiddleware');
const { initApp, startApp, stopApp, getApp } = require('./express/server');
const routing = require('./routing');


const dispose = async () => {
  stopApp();
};

const init = async () => {
  const app = initApp();

  app.use(timeout(300000));
  app.use(responseTime());
  app.use(bodyParser.json({ limit: '50mb' })); // support json encoded bodies
  app.use(bodyParser.urlencoded({ limit: '50mb', parameterLimit: 1000000, extended: true }));
  app.set('trust proxy', true);
  app.use(compression({ level: zlib.constants.Z_BEST_SPEED, strategy: zlib.constants.Z_DEFAULT_STRATEGY }));
  app.use(authMiddleware);
  routing.init();
  app.use(errorMiddleware);

  startApp();
};


module.exports = {
  initApp,
  startApp,
  stopApp,
  getApp,
  init,
  dispose
}