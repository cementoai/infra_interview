/* eslint-disable no-unused-vars */
const Yup = require('yup');
const APIClient = require('../../../common/apiClient');
const APIMeta = require('../../../common/apiMeta');

class CommentsAPIClient extends APIClient {
  static async getComments({ parentId }) {
    return APIMeta.GET('/comments', {
      query: {
        parentId: Yup.string().required(),
      }
    });
  }

  static async createComment({ ...comment }) {
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
