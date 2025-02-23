class IssueResponse {
  constructor(object) {
    this.id = object.id;
    this.data = object.data;
    this.assignTo = object.assignTo;
    this.comments = object.comments;
  }
}

module.exports = IssueResponse;
