const express = require('express');
const IssuesService = require('../domain/services/issuesService');
const IssueMapper = require('../infrastructure/mappers/issueMapper');

const router = express.Router();
const prefix = 'issues';

async function getIssueById(req, res) {
  const { id } = req.params;
  const { withComments } = req.query;
  let service = new IssuesService();
  let issue = await service.getById({id, withComments });
  res.send(IssueMapper.toResponse(issue));
}

async function getIssues(req, res) {
  const { ids, withComments, fields } = req.query;
  let filterParams = { ids, withComments};
  let service = new IssuesService();
  let issues = await service.getList(filterParams, { include: fields });
  res.send(issues.map(issue => IssueMapper.toResponse(issue)));
}

async function createIssue(req, res) {
  const issue = req.body;
  let service = new IssuesService();
  let upserted = await service.create(issue);
  res.send(IssueMapper.toResponse(upserted));
}

router.get('/:id', getIssueById);
router.get('/', getIssues);
router.post('/', createIssue);

module.exports = {
  router,
  prefix
};
