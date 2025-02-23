const Joi = require('joi');
const DBObjectSchema = require('../../../../common/dbObjectSchema');

module.exports = new DBObjectSchema(
  'Data',
  'issues',
  {
    id: Joi.string().required(),
    description: Joi.string().required(),
    assignTo: Joi.object({ id: Joi.string().required() }).optional(),
    data: Joi.object().optional(),
  },
  [
    {
      id: 1,
      options: { unique: true }
    },
    { 'assignTo.id': 1 },
  ]
);
