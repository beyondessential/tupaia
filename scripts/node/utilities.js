/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const winston = require('winston');

const configureWinston = () =>
  winston.configure({
    transports: [
      new winston.transports.Console({
        level: 'verbose',
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.printf(({ message }) => message),
        ),
      }),
    ],
  });

let isWinstonConfigured = false;

const getLoggerInstance = () => {
  if (!isWinstonConfigured) {
    configureWinston();
    isWinstonConfigured = true;
  }
  return winston;
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
