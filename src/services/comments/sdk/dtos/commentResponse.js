class CommentResponse {
  constructor(object) {
    this.id = object.id;
    this.parentId = object.parentId;
    this.description = object.description;
  }
}

module.exports = CommentResponse;
