const logger = require('../logger');

module.exports = function(err, req, res, next) {
  // log error
  logger.error(err.message, err);

  res.status(500).send('Something went wrong...');
};