class CommentResponse {
  constructor(object) {
    this.id = object.id;
    this.parentId = object.parentId;
    this.description = object.description;
    this.createdAt = object.createdAt;
  }
}

module.exports = CommentResponse;
