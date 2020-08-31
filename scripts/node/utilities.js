/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const winston = require('winston');

winston.configure({
  transports: [
    new winston.transports.Console({
      level: 'verbose',
      format: winston.format.combine(
        winston.format.colorize({
          all: true,
        }),
        winston.format.printf(({ message }) => message),
      ),
    }),
  ],
});

module.exports = {
  logger: winston,
};
