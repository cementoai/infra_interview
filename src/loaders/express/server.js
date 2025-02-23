const express = require('express');
const Logger = require('../../common/logger');


let app;
let server;
let port = 8080;


const initApp = () => {
  app = app || express();
  return app;
};

const startApp = async () => {
  if (!app) throw new Error('App not initialized!');
  server = app.listen(port, () => Logger.info(`Cemento app listening ${port}`));
  server.keepAliveTimeout = 1.5 * 60 * 1000;
  server.headersTimeout = 2.5 * 60 * 1000;
};

const stopApp = () => {
  if (server) server.close();
};

const getApp = () => {
  if (!app) throw new Error('App not initialized!');
  return app;
};

module.exports = {
  initApp,
  startApp,
  stopApp,
  getApp,
}