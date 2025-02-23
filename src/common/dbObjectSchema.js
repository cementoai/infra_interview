const Joi = require('joi');
const MongoUtils = require('./mongo');


class DBObjectSchema {
  static NON_UPDATABLE = new Set(['createdTS', 'createdAt']);


  constructor(dbName, collectionName, schema, indexes) {
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.schema = Joi.object(schema);
    this.indexes = indexes;
    this._schema = schema;
    this.uniques = this._getUniquesCombinations(indexes);
    MongoUtils.createIndexes(dbName, collectionName, indexes);
  }
  
  map(obj, options = { stripUnknown: true, stripUndefined: true, generateDefaults: true }) {
    if (this._schema.updatedTS) obj.updatedTS = Date.now();
    if (this._schema.editedAt) obj.editedAt = Date.now();
    if (this._schema.createdTS && !obj.createdTS) obj.createdTS = obj.createdTS || Date.now();
    if (this._schema.createdAt && !obj.createdAt) obj.createdAt = obj.createdAt || Date.now();
    return Joi.attempt(obj, this.schema, options);
  }

  _getUniquesCombinations(indexes) {
    return indexes
      .filter(idx => idx.options?.unique)
      .map(idx => { 
        let fields = { ...idx };
        delete fields.options;
        return Object.keys(fields);
      })
      .sort((a, b) => a.length - b.length);
  }

  _clear_undefined(obj) {
    Object.keys(obj).forEach(k => { 
      if (obj[k] === undefined)
        delete obj[k];
    });

    return obj;
  }
}

module.exports = DBObjectSchema;
