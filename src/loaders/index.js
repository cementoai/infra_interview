const dotenv = require('dotenv');
const uuidv4 = require('uuid/v4');
const { MongoMemoryServer } = require('mongodb-memory-server');
const MongoUtils = require('../common/mongo');
const Logger = require('../common/logger');
const server = require('./server');
const consumers = require('./consumers');
const APIClient = require('../common/apiClient');

dotenv.config();

exports.init = async () => {
  await _init_logger();
  await _init_mongo();
  await _init_apiClient();
  await consumers.init();
  await server.init();
};

exports.dispose = async () => {
  await server.dispose();
  await MongoUtils.disconnect();
};

async function _init_mongo() {
  const mongoServer = await MongoMemoryServer.create({
    instance: { port: 27017, ip: '127.0.0.1', dbName: 'testlocal' },
    binary: { version: '7.0.4' }
  });

  const mongoUrl = mongoServer.getUri();
  await MongoUtils.initConnection(mongoUrl, process.env.ENV);
}

async function _init_logger() {
  Logger.init(process.env.ENV, process.env.SERVICE, true, true, uuidv4(), () => {}, uuidv4());
}

async function _init_apiClient() {
  APIClient.init('this_is_a_valid_token_use_it');
}
