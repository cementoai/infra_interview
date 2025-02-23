const express = require('express');
const server = require('./express/server');
const { errorsWrapper } = require('./express/middlewares/errorsMiddleware');
const { authMiddleware } = require('./express/middlewares/authMiddleware');
const issuesRouter = require('../services/issues/interfaces/issuesRouter');
const commentsRouter = require('../services/comments/interfaces/commentsRouter');


const registered_routes = {
  [`/${issuesRouter.prefix}`]: issuesRouter.router,
  [`/${commentsRouter.prefix}`]: commentsRouter.router,
};

exports.init = async () => {
  const app = server.getApp();
  app.get('/', (req, res, next) => { res.send(`Welcome!!!`); next(); });
  Object.keys(registered_routes).forEach(route => (registered_routes[route] = wrapRouteHandlers(registered_routes[route])));
  Object.keys(registered_routes).forEach(route => app.use(route, registered_routes[route]));
};

const wrapRouteHandlers = function (router) {
  let expandedRouter = express.Router();
  router.stack.forEach(layer => {
    Object.entries(layer.route.methods).forEach(([method, active]) => {
      if (!active) return;
      let handlersStack = layer.route.stack.map(curr => curr.handle);
      for (let i = 0; i < handlersStack.length; i++) handlersStack[i] = errorsWrapper(handlersStack[i]);
      expandedRouter[method](layer.route.path, [authMiddleware, ...handlersStack, () => {}]);
    });
  });

  return expandedRouter;
};