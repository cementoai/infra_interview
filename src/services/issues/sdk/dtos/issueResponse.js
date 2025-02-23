class IssueResponse {
  constructor(object) {
    this.id = object.id;
    this.data = object.data;
    this.assignTo = object.assignTo;
  }
}

module.exports = IssueResponse;
