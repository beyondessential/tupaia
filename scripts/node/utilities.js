/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const winston = require('winston');

const LOG_LEVEL_CONFIG = {
  error: 'red',
  warn: 'yellow',
  success: 'green',
  info: 'cyan',
  verbose: 'dim white',
  debug: 'gray',
};

const createLogger = () => {
  winston.addColors(LOG_LEVEL_CONFIG);
  const levels = Object.fromEntries(
    Object.entries(LOG_LEVEL_CONFIG).map(([level], i) => [level, i]),
  );

  return winston.createLogger({
    levels,
    transports: [
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(({ message }) => message),
        ),
      }),
    ],
  });
};

let logger;

const getLoggerInstance = () => {
  if (!logger) {
    logger = createLogger();
  }
  return logger;
};

const executeCommand = async command => {
  const { stdout } = await promisify(exec)(command);
  return stdout;
};

/**
 * Executes all the provided commands in order, exiting as soon as one of them fails
 *
 * @param {string[]} commands
 */
const executeAllCommands = async commands => executeCommand(commands.join(' && '));

module.exports = {
  getLoggerInstance,
  executeCommand,
  executeAllCommands,
};
