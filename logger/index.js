const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const logFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(label({ label: 'vidly' }), timestamp(), logFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logfile.log' }),
  ],
});

module.exports = logger;
