const mongoose = require('mongoose');
const logger = require('../logger');
const config = require('config');

module.exports = function(callback) {
  const db = config.get('db');
  mongoose
    .connect(
      db,
      { useNewUrlParser: true }
    )
    .then(() => {
      logger.info(`Connected to ${db} ...`);
      if(callback) callback();
    })
    .catch((err) => {
      logger.error(`Could not connect to ${db}`)
    });;

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', function() {
    mongoose.connection.close(function() {
      logger.info('Disconnected to MongoDB on app termination');
      process.exit(0);
    });
  });
};
