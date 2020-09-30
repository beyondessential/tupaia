import winston from 'winston';

winston.configure({
  transports: [
    new winston.transports.File({
      filename: 'logfile.log',
      maxFiles: 2, // this is, current file + 2 archive files
      maxsize: 1024 * 1024, // cap at 1MB per file
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

winston.level = process.env.LOG_LEVEL || 'info';

// override error handler to ensure stack trace is preserved
// -- see https://github.com/winstonjs/winston/issues/1338
winston.error = (item, params) => {
  const message = item instanceof Error ? item.stack : item;
  winston.log({ level: 'error', message, ...params });
};

export default winston;
