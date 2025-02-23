const routeEndsMiddleware = (req, res, next) => {
  req.path.substr(-1) === '/' && req.path.length > 1 ? res.status(406).send({ message: 'Invalid path' }) : next();
};

module.exports = {
  routeEndsMiddleware
};
