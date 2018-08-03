const logger = require('./logger');

require('./startup/global-error')();
require('./startup/config')();
require('./startup/validation')();
require('./startup/db')();

const app = require('./app');
require('./startup/routes')(app);
require('./startup/prod')(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`App started at port ${port}`);
});