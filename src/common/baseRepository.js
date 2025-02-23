const _ = require('lodash');
const MongoUtils = require('./mongo');
const Logger = require('./logger');
const Errors = require('./errors');
const DBObjectSchema = require('./dbObjectSchema');
const { removeNulls } = require('./utils');



class BaseRepository {
  constructor(schema, mapper) {
    this.collection = MongoUtils.getCollection(schema.collectionName, schema.dbName);
    this.collectionName = schema.collectionName;
    this.mapper = mapper;
    this.schema = schema;
    this.schemaUnsetFields = Object.keys(schema._schema || {}).reduce((unsetFields, k) => {
      unsetFields[k] = '';
      return unsetFields;
    }, {});
    this.schemaMainIdentifiers = (schema.uniques || [])[0] || ['id'];
    this.defaultProjection = { id: 1 };
    this.schemaMainIdentifiers.forEach(id => (this.defaultProjection[id] = 1));
    this.hooks = {
      beforeChange: [],
      afterChange: [],
      afterDelete: [],
    };
  }

  addHook(hookType, fn) {
    if (this.hooks[hookType]) this.hooks[hookType].push(fn);
    else throw new Error(`Invalid hook type: ${hookType}`);
  }

  async getById(id, { include, exclude } = {}) {
    let query = { id };
    let projection = this._getProjection(include, exclude);
    let options = { projection };
    let res = await this.collection.findOne(query, options);
    if (!res) throw new Errors.NotFoundError(`Entity ${id} not found`);
    return res;
  }

  async getCount(filters = {}) {
    let query = this._filtersToQuery(filters);
    return await this.collection.countDocuments(query);
  }

  async getList(filters = {}, { include, exclude, sort, limit, page } = {}) {
    let query = this._filtersToQuery(filters);
    let projection = this._getProjection(include, exclude);
    let cursor = this.collection.find(query, { projection });

    if (sort) cursor = cursor.sort(sort);
    if (page) cursor = cursor.skip(limit * page);
    if (limit) cursor = cursor.limit(limit);

    return await cursor.toArray();
  }

  async create(model) {
    try {
      let { dbObject } = this._toDBObjectCreate(model);
      await this._executeHooks('beforeChange', dbObject);
      let res = await this.collection.insertOne(dbObject);
      if (!res.acknowledged) throw new Errors.ServerError(`Failed create object ${dbObject.id} in DB`);
      Logger.info('object created successfully', { _id: res.insertedId, id: dbObject.id });
      await this._executeHooks('afterChange', dbObject);
      return { _id: res.insertedId, ...dbObject };
    } catch (error) {
      throw (error.code === 11000) ? new Errors.ConflictError(error.message) : error;
    }
  }

  async createMany(models) {
    try {
      let dbObjects = models.map(model => this._toDBObjectCreate(model).dbObject);
      await this._executeHooks('beforeChange', dbObjects);
      let res = await this.collection.insertMany(dbObjects);
      if (!res.acknowledged) throw new Errors.ServerError(`Failed create ${dbObjects.length} objects in DB`);
      Logger.info(`${dbObjects.length} objects created successfully`);
      await this._executeHooks('afterChange', dbObjects);
      return Object.keys(res.insertedIds).map(i => ({ _id: res.insertedIds[i], ...dbObjects[i] }));
    } catch (error) {
      throw (error.code === 11000) ? new Errors.ConflictError(error.message) : error;
    }
  }

  async update(model, upsert = false) {
    try {
      let { dbObject, unsetFields, setFields, setOnInsertFields, identifiers } = this._toDBObjectUpdate(model, upsert);
      await this._executeHooks('beforeChange', dbObject);
      let res = await this.collection.updateOne({ ...identifiers }, { $set: setFields, $unset: unsetFields, ...(upsert && { $setOnInsert: setOnInsertFields }) }, { upsert: upsert });
      if (!res.acknowledged) throw new Errors.ServerError(`Failed upserting object ${JSON.stringify(identifiers)} in DB`);
      if (!upsert && !res.matchedCount) throw new Errors.NotFoundError(`Failed updating object. object ${JSON.stringify(identifiers)} does not exists in DB`);
      Logger.info('object updated successfully', { _id: res.insertedId, id: dbObject.id, upsert });
      await this._executeHooks('afterChange', dbObject);
      return { _id: res.upsertedId, ...dbObject };
    } catch (error) {
      throw (error.code === 11000) ? new Errors.ConflictError(error.message) : error;
    }
  }

  async updateMany(models, upsert = false) {
    try {
      if (!models?.length) return [];
      let dbObjects = [];
      let bulkUpdates = models.map(model => {
        let { dbObject, unsetFields, setFields, setOnInsertFields, identifiers } = this._toDBObjectUpdate(model, upsert);
        dbObjects.push(dbObject);
        return {
          updateOne: {
            filter: identifiers,
            update: { $set: setFields, $unset: unsetFields, ...(upsert && { $setOnInsert: setOnInsertFields }) },
            upsert: upsert,
          },
        };
      });
      await this._executeHooks('beforeChange', dbObjects);
      let res = await this.collection.bulkWrite(bulkUpdates);
      if (res.matchedCount + res.upsertedCount != bulkUpdates.length)
        throw new Errors.ServerError(`Failed updating some objects. ${res.matchedCount + res.upsertedCount} succeeded out of ${bulkUpdates.length}`);
      Logger.info('objects updated successfully', { upsert });
      await this._executeHooks('afterChange', dbObjects);
      return dbObjects;
    } catch (error) {
      throw (error.code === 11000) ? new Errors.ConflictError(error.message) : error;
    }
  }

  async updateObjectFields(identifier, updates) {
    try {
      identifier = this._getIdentifiers(identifier);
      let { dbUpdates } = this._toObjectFieldsUpdate(updates);
      let updatedObject = { ...dbUpdates, ...identifier };
      await this._executeHooks('beforeChange', updatedObject);
      let res = await this.collection.updateOne({ ...identifier }, { $set: dbUpdates });
      if (!res.acknowledged) throw new Errors.ServerError(`Failed updating object ${Object.stringify(identifier)} in DB`);
      if (!res.matchedCount) throw new Errors.NotFoundError(`Failed updating object fields. object ${JSON.stringify(identifier)} does not exists in DB`);
      Logger.info('object fields updated successfully', { updatedObject: JSON.stringify(updatedObject) });
      await this._executeHooks('afterChange', updatedObject);
      return updatedObject;
    } catch (error) {
      throw (error.code === 11000) ? new Errors.ConflictError(error.message) : error;
    }
  }

  async updateManyObjectsFields(filters = {}, updates) {
    let query = this._filtersToQuery(filters);
    await this._updateManyObjectsFields(query, updates);
  }

  async deleteById(id) {
    await this._delete({ id });
  }

  async deleteManyByIds(ids) {
    ids = [...new Set(ids || [])];
    if (!ids.length) {
      Logger.info('no ids to delete');
      return;
    }
    await this._deleteMany({ id: { $in: ids } }, ids.length);
  }

  async _delete(query) {
    let deletedCount = 0;
    if (this.hooks.afterDelete.length) {
      let deletedObject = await this.collection.findOneAndDelete(query);
      deletedCount = deletedObject ? 1 : 0;
      await this._executeHooks('afterDelete', deletedObject);
    } else {
      let result = await this.collection.deleteOne(query);
      deletedCount = result.deletedCount;
    }
    deletedCount === 0 ? Logger.warn('no documents matched the query. Deleted 0 documents.') : Logger.info(`successfully deleted ${deletedCount} document.`);
  }

  async _deleteMany(query, expectedDeleteCount) {
    let deletedObjects = [];
    if (this.hooks.afterDelete.length) deletedObjects = await this.collection.find(query).toArray();
    let res = await this.collection.deleteMany(query);
    await this._executeHooks('afterDelete', deletedObjects);
    res.deletedCount === expectedDeleteCount
      ? Logger.info(`successfully deleted ${res.deletedCount} documents.`)
      : Logger.warn(`${res.deletedCount} documents deleted out of ${expectedDeleteCount}`);
  }

  async _updateManyObjectsFields(query, updates) {
    try {
      let { dbUpdates } = this._toObjectFieldsUpdate(updates);
      let changedDataList = [];
      if (this.hooks.beforeChange.length || this.hooks.afterChange.length) changedDataList = (await this.collection.find(query).toArray()).map(doc => ({ ...doc, ...dbUpdates }));
      await this._executeHooks('beforeChange', changedDataList);
      let res = await this.collection.updateMany(query, { $set: dbUpdates }, { multi: true });
      if (!res.acknowledged) throw new Errors.ServerError(`Failed updating objects in DB`);
      await this._executeHooks('afterChange', changedDataList);
      Logger.info('objects fields updated successfully', { dbUpdates: JSON.stringify(dbUpdates) });
    } catch (error) {
      throw (error.code === 11000) ? new Errors.ConflictError(error.message) : error;
    }
  }

  async _executeHooks(hookType, changedData) {
    if (!changedData) return;
    const changedDataArray = Array.isArray(changedData) ? changedData : [changedData];
    if (!changedDataArray.length) return;
    
    for (const hook of this.hooks[hookType]) {
      try {
        await hook(changedDataArray);
      } catch (error) {
        if (error instanceof Errors.HookError) {
          throw error;
        } else {
          Logger.error(`Error executing hook of type '${hookType}':`, { error });
        }
      }
    }
  }

  _filtersToQuery(filters = {}) {
    throw new Errors.NotImplementedError();
  }

  _getProjection(include, exclude) {
    if (include && include.length && exclude && exclude.length) throw new Errors.ServerError(`Can not both include and exclude fields`);

    if (include && include.length)
      return include.reduce(
        (projectionMap, key) => {
          projectionMap[key] = 1;
          return projectionMap;
        },
        { ...this.defaultProjection },
      );

    if (exclude && exclude.length)
      return exclude.reduce((projectionMap, key) => {
        if (!this.defaultProjection[key]) projectionMap[key] = 0;
        return projectionMap;
      }, {});
  }

  _getUpdatablesFields(obj) {
    let updatables = {},
      nonUpdatables = {};
    Object.keys(obj).forEach(k => (DBObjectSchema.NON_UPDATABLE.has(k) ? (nonUpdatables[k] = obj[k]) : (updatables[k] = obj[k])));
    return { updatables, nonUpdatables };
  }

  _getOnlySchemaFields(obj) {
    return _.pick(obj, Object.keys(this.schema._schema));
  }

  _updateUpdateTS(obj) {
    if (this.schema._schema.updatedTS) obj.updatedTS = Date.now();
    return obj;
  }

  _getIdentifiers(obj) {
    let identifiers = _.pick(obj, this.schemaMainIdentifiers);
    if (Object.keys(identifiers).length !== this.schemaMainIdentifiers.length) throw new Errors.ServerError('Could not update models, not all has identifiers');
    return identifiers;
  }

  _getUnsetFields(dbObject) {
    let unsetFields = { ...this.schemaUnsetFields };
    Object.keys(dbObject).forEach(field => delete unsetFields[field]);
    return unsetFields;
  }

  _toDBObjectCreate(model) {
    let dbObject = this.mapper.toDBObject(model);
    removeNulls(dbObject);
    return { dbObject };
  }

  _toDBObjectUpdate(model, upsert) {
    let dbObject = this.mapper.toDBObject(model);
    let identifiers = this._getIdentifiers(dbObject);
    removeNulls(dbObject);
    let unsetFields = this._getUnsetFields(dbObject);
    let { updatables, nonUpdatables } = this._getUpdatablesFields(dbObject);
    let setFields = updatables;
    let setOnInsertFields = upsert ? nonUpdatables : {};
    return { dbObject, unsetFields, setFields, setOnInsertFields, identifiers };
  }

  _toObjectFieldsUpdate(updates) {
    let onlySchemaFields = this._getOnlySchemaFields(updates);
    let { updatables } = this._getUpdatablesFields(onlySchemaFields);
    let dbUpdates = this._updateUpdateTS(updatables);
    let unsetFields = this._removeNullsAndGetUnset(dbUpdates);
    return { dbUpdates, unsetFields };
  }

  _removeNullsAndGetUnset(dbUpdates) {
    let removedPaths = removeNulls(dbUpdates, true);
    let unsetFields = (removedPaths || []).reduce((unset, path) => {
      if (dbUpdates[path] === undefined) unset[path] = '';
      return unset;
    }, {});
    return unsetFields;
  }
}


module.exports = BaseRepository;
