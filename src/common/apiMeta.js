const Yup = require('yup');

class APIMeta {
  constructor({ path, method, body = {}, query = {}, params = {} }) {
    this.path = path[0] === '/' ? path : `/${path}`;
    this.method = method;
    this.bodySchema = schema(body);
    this.querySchema = schema(query);
    this.paramsSchema = schema(params);
  }

  static POST(path, { body, query, params }) {
    return new  APIMeta({ method: 'POST', path, body, query, params })
  }

  static GET(path, { body, query, params }) {
    return new APIMeta({ method: 'GET', path, body, query, params })
  }

  static PATCH(path, { body, query, params }) {
    return new  APIMeta({ method: 'PATCH', path, body, query, params })
  }

  static PUT(path, { body, query, params }) {
    return new  APIMeta({ method: 'PUT', path, body, query, params })
  }

  static DELETE(path, { body, query, params }) {
    return new  APIMeta({ method: 'DELETE', path, body, query, params })
  }
}

function schema(schemaObject) {
	Object.keys(schemaObject).forEach(k => {
		schemaObject[k].spec.nullable = schemaObject[k].spec.nullable || schemaObject[k].spec.optional;
		if (schemaObject[k] instanceof Yup.ObjectSchema) schema(schemaObject[k].fields);
	});
	return schemaObject instanceof Yup.ObjectSchema ? schemaObject : Yup.object(schemaObject);
}

module.exports = APIMeta