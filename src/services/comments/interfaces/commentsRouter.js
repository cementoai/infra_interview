const express = require('express');
const CommentsService = require('../domain/services/commentsService');
const CommentMapper = require('../infrastructure/mappers/commentMapper');

const router = express.Router();
const prefix = 'comments';

async function getComments(req, res) {
  const { parentId } = req.query;
  let filterParams = { parentId };
  let service = new CommentsService();
  let comments = await service.getList(filterParams);
  res.send(comments.map(comment => CommentMapper.toResponse(comment)));
}

async function createComment(req, res) {
  const comment = req.body;
  let service = new CommentsService();
  let upserted = await service.upsert(comment);
  res.send(CommentMapper.toResponse(upserted));
}

router.get('/', getComments);
router.post('/', createComment);

module.exports = {
  router,
  prefix
};
