const express = require('express');
const IssuesService = require('../domain/services/issuesService');
const IssueMapper = require('../infrastructure/mappers/issueMapper');

const router = express.Router();
const prefix = 'issues';

async function getIssueById(req, res) {
  const { id } = req.params;
  let service = new IssuesService();
  let issue = await service.getById(id);
  res.send(IssueMapper.toResponse(issue));
}

async function getIssues(req, res) {
  const { ids, fields } = req.query;
  let filterParams = { ids };
  let service = new IssuesService();
  let issues = await service.getList(filterParams, { include: fields });
  res.send(issues.map(issue => IssueMapper.toResponse(issue)));
}

async function upsertIssue(req, res) {
  const { id } = req.params;
  const issue = req.body;
  let service = new IssuesService();
  let upserted = await service.upsert({ ...issue, id});
  res.send(IssueMapper.toResponse(upserted));
}

router.get('/:id', getIssueById);
router.get('/', getIssues);
router.put('/:id', upsertIssue);

module.exports = {
  router,
  prefix
};
