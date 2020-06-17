/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const { spawnSync } = require('child_process');
const { existsSync, readdirSync } = require('fs');

const { logger } = require('./utilities');

/**
 * @abstract
 */
class Script {
  STATUS_CODES = {
    SUCCESS: 0,
    ERROR: 1,
  };

  options;

  constructor() {
    const [, , ...args] = process.argv;
    this.options = this.parseOptions(args);
  }

  /**
   * @abstract
   */
  // eslint-disable-next-line class-methods-use-this
  run() {
    throw new Error('Any subclass of Script must implement the "run" method');
  }

  parseOptions(args) {
    return {};
  }

  logError = (message = '') => {
    logger.error(message);
  };

  logWarning = (message = '') => {
    logger.warn(message);
  };

  logSuccess = (message = '') => {
    logger.info(message);
  };

  logInfo = (message = '') => {
    logger.info(message);
  };

  log = (message = '') => {
    logger.verbose(message);
  };

  /**
   * @returns {boolean} True if the command exited with a success status
   */
  exec = (commandString, { printOutput = true }) => {
    const [command, ...args] = commandString.split(' ');

    const { stderr, status } = spawnSync(command, args, {
      stdio: printOutput ? 'inherit' : 'ignore',
    });
    return !stderr && status === this.STATUS_CODES.SUCCESS;
  };

  exit(success = true) {
    process.exit(success ? this.STATUS_CODES.SUCCESS : this.STATUS_CODES.ERROR);
  }

  findFolders = (path = '.') =>
    readdirSync(path, { withFileTypes: true }).filter(entry => entry.isDirectory());

  findFolderNames = path => this.findFolders(path).map(({ name }) => name);

  checkPathExists = path => existsSync(path);
}

module.exports = Script;
