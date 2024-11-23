//use middleware to auto clear cache as needed

const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  await next(); //wait routeHandler do every thing need to do.E.g. create a post
  //after create a post
  clearHash(req.user.id);
};
