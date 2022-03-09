/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';

// Custom formatter for Errors
// -- see https://github.com/winstonjs/winston/issues/1338
// -- https://github.com/winstonjs/winston/issues/1338#issuecomment-393238865
// -- https://github.com/winstonjs/winston/issues/1338#issuecomment-401303586
const enumerateErrorFormat = winston.format(info => {
  const msg = info.message as any;
  if (msg instanceof Error) {
    info.message = Object.assign(
      {
        message: msg.message,
        stack: msg.stack,
      },
      info.message,
    );
  }

  if (info instanceof Error) {
    return Object.assign(
      {
        message: info.message,
        stack: info.stack,
      },
      info,
    );
  }

  return info;
});

winston.configure({
  format: winston.format.combine(winston.format.timestamp(), enumerateErrorFormat()),
  transports: [
    new winston.transports.File({
      filename: 'logfile.log',
      maxFiles: 2, // this is, current file + 2 archive files
      maxsize: 1024 * 1024, // cap at 1MB per file
      format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

winston.level = process.env.LOG_LEVEL || 'info';

export default winston;
