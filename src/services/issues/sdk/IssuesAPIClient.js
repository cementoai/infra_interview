/* eslint-disable no-unused-vars */
const Yup = require('yup');
const APIClient = require('../../../common/apiClient');
const APIMeta = require('../../../common/apiMeta');

class IssuesAPIClient extends APIClient {
  static async getIssue({ id, withComments }) {
    return APIMeta.GET('/issues/:id', {
      params: {
        id: Yup.string().required(),
        withComments: Yup.boolean(),
      }
    });
  }


  static async getIssues({ ids, fields, withComments }) {
    return APIMeta.GET('/issues', {
      query: {
        ids: Yup.array().of(Yup.string()),
        withComments: Yup.boolean(),
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
