const { MongoClient } = require('mongodb');
const utils = require('./utils');

const DEFAULT_DB_NAME = 'Data';
const PRIMARY_CONNECTION_TAG = 'primary';

// mongodb package documentation: https://mongodb.github.io/node-mongodb-native/6.3/modules.html
class MongoUtils {
  static client = {};
  static env = null;
  static initConnectionInProgress = {};
  static collectionsByDB = {};
  static registeredIndexes = [];
  static aggregationOptions = {
    allowDiskUse: true,
    maxTimeMS: 60000,
  };

  static async initConnection(url, env, tag = PRIMARY_CONNECTION_TAG) {
    if (this.client[tag])
      return;

    if (!url || !env)
      throw new Error('DB url and ENV must defined');

    let retries = 3;
    let initialState = this.initConnectionInProgress[tag];
    this.initConnectionInProgress[tag] = true;
    this.env = env;

    if (initialState)
      await utils.wait(() => this.initConnectionInProgress[tag], 100);

    while (!this.client[tag] && retries--) {
      try {
        this.client[tag] = new MongoClient(url);
        await this.client[tag].connect();
        if (tag === PRIMARY_CONNECTION_TAG)
          await this._createIndexes(this.registeredIndexes);
      } catch (e) {
        if (!retries) throw e;
      }
    }

    this.initConnectionInProgress[tag] = false;
  }

  static async disconnect() {
    await Promise.all(Object.values(this.client).map(client => client.close()));
    this.client = {};
  }

  static getCollection(collectionName, dbName = DEFAULT_DB_NAME, connectionTag = PRIMARY_CONNECTION_TAG) {
    if (!this.client[connectionTag])
      throw new Error(`MongoUtils: Please initialize ${dbName} DB connection first`);

    dbName = this.getDBName(dbName);

    if (!this.collectionsByDB[connectionTag])
      this.collectionsByDB[connectionTag] = {};

    if (!this.collectionsByDB[connectionTag][dbName])
      this.collectionsByDB[connectionTag][dbName] = { collections: {} };

    if (!this.collectionsByDB[connectionTag][dbName].collections[collectionName])
      this.collectionsByDB[connectionTag][dbName].collections[collectionName] = this.client[connectionTag].db(dbName).collection(collectionName);

    return this.collectionsByDB[connectionTag][dbName].collections[collectionName];
  }

  static getDBName = function (dbName) {
    return dbName
  };

  static createIndexes(dbName, collectionName, indexes) {
    let indexesToCreate = indexes.map(idx => {
      let keys = { ...idx };
      delete keys.options;
      return {
        db: dbName,
        collection: collectionName,
        keys: keys,
        options: idx.options,
      };
    });

    if (this.client[PRIMARY_CONNECTION_TAG])
      this._createIndexes(indexesToCreate);
    else
      this.registeredIndexes = [...this.registeredIndexes, ...indexesToCreate];
  }

  static async _createIndexes(idxArray) {
    await Promise.all(idxArray.map(async idx => {
      try {
        let collection = await MongoUtils.getCollection(idx.collection, idx.db);
        await collection.createIndex(idx.keys, idx.options);
      } catch (e) { }
    }));
  }

  static registerCollectionListener(collectionName, dbName, listenerFunc) {
    let collection = this.getCollection(collectionName, dbName);
    let changeStream = collection.watch();

    // available listeners create, delete, insert, change
    changeStream.on('create', async (change) => listenerFunc('create', change, change.fullDocument));
    changeStream.on('change', async (change) => {
      let updatedDocument = await collection.findOne({ _id: change.documentKey._id });
      listenerFunc('change', change, updatedDocument);
    });
  }

  static async startSession(connectionTag = PRIMARY_CONNECTION_TAG) {
    const session = this.client[connectionTag].startSession();
    return session;
  }
}

module.exports = MongoUtils;
