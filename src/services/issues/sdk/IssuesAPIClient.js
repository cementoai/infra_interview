/* eslint-disable no-unused-vars */
const Yup = require('yup');
const APIClient = require('@cemento/network/src/apiClient/apiClient');
const APIMeta = require('@cemento/network/src/apiClient/apiMeta');

class IssuesAPIClient extends APIClient {
  static async getComment({ id, lean }) {
    return APIMeta.GET('/issues/:id', {
      params: {
        id: Yup.string().required()
      }
    });
  }


  static async getComments({ ids, fields }) {
    return APIMeta.GET('/issues', {
      query: {
        ids: Yup.array().of(Yup.string()),
        fields: Yup.array().of(Yup.string()),
      }
    });
  }

  static async upsertIssue({ ...issue }) {
    return APIMeta.PUT('/issues/:id', {
      params: {
        id: Yup.string().required()
      },
      body: {
        description: Yup.string().required(),
        assignTo: Yup.object({ id: Yup.string().required() }),
        data: Yup.object()
      }
    });
  }
}

IssuesAPIClient.applyAPIWrapper();
module.exports = IssuesAPIClient;
