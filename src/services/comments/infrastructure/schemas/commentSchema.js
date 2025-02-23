const Joi = require('joi');
const DBObjectSchema = require('../../../../common/dbObjectSchema');

module.exports = new DBObjectSchema(
  'Data',
  'comments',
  {
    id: Joi.string().required(),
    parentId: Joi.string().required(),
    description: Joi.string().required(),
    createdAt: Joi.number()
  },
  [
    {
      id: 1,
      options: { unique: true }
    },
    { parentId: 1 },
  ]
);
