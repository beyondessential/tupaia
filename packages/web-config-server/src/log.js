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

export default winston;
