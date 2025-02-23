const _ = require('lodash');
const Yup = require('yup');
const URL = require('url');
const axios = require('axios');
const Logger = require('./logger');
const Errors = require('./errors');
const querystring = require('querystring');


const CEMENTO_ROUTS_PREFIX = '';
const CEMENTO_API_URL = 'http://127.0.0.1:8080';

class APIClient {
  static init(authToken) {
    this.authToken = authToken;
  }
  
  static async applyAPIWrapper() {
    let apiStaticCallers = this._getStaticFunctions(this);
    await Promise.all(apiStaticCallers.map(async apiFuncName => {
      this[apiFuncName] = await this._wrapAPI(this[apiFuncName]);
    }));
  }

  static _getStaticFunctions(cls) {
    const keys = Reflect.ownKeys(cls);
    const names = keys.filter(key => {
      try { return typeof cls[key] === 'function' && cls.hasOwnProperty(key); }
      catch (e) { return false; }
    });
    return names;
  }

  static _extractKeysFromArgs(keys, args) {
    return keys.reduce((extracted, key) => {
      if (args[key] !== undefined) extracted[key] = args[key];
      return extracted;
    }, {});
  }

  static _extractCallArgsFromArgs(apiMeta, args) {
    return [apiMeta.bodySchema, apiMeta.querySchema, apiMeta.paramsSchema].map(schema => {
      let callArgs = _.pick(args, Object.keys(schema.fields));
      return APIClient._validate(callArgs, schema, { stripUnknown: false });
    });
  }

  static _prepareArgumentsObject(...args) {
    return args.reduce((acc, obj) => ({ ...acc, ...obj }), {});
  }
  
  static async _getAPImeta(sdkFunc) {
    return await sdkFunc({}, {});
  }

  static async _prepareAPIcall(apiMeta, argumentsObject) {
    let [body, query, params] = this._extractCallArgsFromArgs(apiMeta, argumentsObject);
    let path = apiMeta.path;
    Object.keys(params).forEach(key => (path = path.replace(`:${key}`, params[key])));
    path = CEMENTO_ROUTS_PREFIX + path;
    return { url: CEMENTO_API_URL + path, apiPath: path, method: apiMeta.method, body, query, params };
  }

  static async _executeAPIcall(apiMeta, argumentsObject) {
    const { url, method, body, query, apiPath } = await this._prepareAPIcall(apiMeta, argumentsObject);
    const headers = this._generateHeader(method, apiPath);
    const fullUrl = this._buildUrlQuery(url, query);
    return (await axios({ query, url: fullUrl, method, headers, data: (method !== 'GET' ? body : undefined) })).data;
  }

  static async _wrapAPI(sdkFunc) {
    return this._api_wrapper(sdkFunc);
  }

  static _generateHeader(method, path) {
    return {
      authorization: `Bearer ${this.authToken}`,
    };
  }

  static _api_wrapper(sdkFunc) {
    return async (...args) => {
      const apiMeta = await this._getAPImeta(sdkFunc);
      const argumentsObject = this._prepareArgumentsObject(...args);
      return await this._executeAPIcall(apiMeta, argumentsObject);
    }
  }

  static _validate(object, schema, { stripUnknown = true, stripUndefined = false, strict = true, abortEarly = true, generateDefaults = false }) {
    try {
      let obj = { ...object };
  
      if (generateDefaults)
        Object.keys(schema.fields).forEach(k => {
          if (obj[k] === undefined && schema.fields[k].spec.default !== undefined) obj[k] = schema.fields[k].getDefault();
        });
  
      if (stripUnknown || stripUndefined)
        Object.keys(obj).forEach(k => {
          if (stripUnknown && !schema.fields[k]) delete obj[k];
          else if (stripUndefined && obj[k] === undefined) delete obj[k];
        });
  
      return schema.validateSync(obj, { strict, abortEarly });
    } catch (error) {
      Logger.error('schema validation error', { error });
      throw new Errors.InvalidParamError(String(error));
    }
  }
  
  static _buildUrlQuery(url, query) {
    if (!query || !Object.keys(query).length || url.includes('?')) return url;
    query = { ...query }

    let parsedUrl = URL.parse(url);

    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value))
        query[key] = JSON.stringify(value);
      else if (value === undefined)
        delete query[key];
    }

    parsedUrl.search = querystring.stringify(query);
    return URL.format(parsedUrl).replace(`${url}/?`, `${url}?`);
  }

}


module.exports = APIClient;
