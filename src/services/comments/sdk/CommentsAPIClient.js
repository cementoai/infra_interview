/* eslint-disable no-unused-vars */
const Yup = require('yup');
const APIClient = require('@cemento/network/src/apiClient/apiClient');
const APIMeta = require('@cemento/network/src/apiClient/apiMeta');

class CommentsAPIClient extends APIClient {
  static async getComments({ parentId }) {
    return APIMeta.GET('/comments', {
      query: {
        parentId: Yup.array().of(Yup.string()).required(),
      }
    });
  }

  static async upsertComment({ ...comment }) {
    return APIMeta.POST('/comments', {
      body: {
        description: Yup.string().required(),
        parentId: Yup.string().required(),
      }
    });
  }
}

CommentsAPIClient.applyAPIWrapper();
module.exports = CommentsAPIClient;
