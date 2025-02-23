const IssuesAPIClient = require('../../services/issues/sdk/IssuesAPIClient');
const CommentsAPIClient = require('../../services/comments/sdk/CommentsAPIClient');


module.exports = {
  comments: CommentsAPIClient,
  issues: IssuesAPIClient,
};
