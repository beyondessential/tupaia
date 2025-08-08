import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { platform } from 'os';

import { getLoggerInstance } from './getLoggerInstance';

/**
 * @typedef {Object} ScriptConfig
 * @property {string} [command] Use '*' or '$0' to refer to the default command
 *   This field is useful for
 *   1. Defining subcommands, eg 'push <branch_name>'
 *   2. Defining positional arguments in the default command, eg '* <path>'
 * @property {Object} [options]
 * @property {string} [usage]
 * @property {string} [version]
 *
 * @see https://github.com/yargs/yargs/blob/master/docs/api.md
 */

/**
 * @param {ScriptConfig} scriptConfig
 */
export const getArgs = scriptConfig => {
  const allowedYargsKeys = ['scriptName', 'command', 'options', 'usage', 'version'];

  const yargs = require('yargs');
  yargs.strict();
  Object.entries(scriptConfig).forEach(([key, value]) => {
    if (allowedYargsKeys.includes(key)) {
      // Allows for multiple calls to the same yargs function (eg. { command: ['format', 'lint'] })
      if (Array.isArray(value)) {
        value.forEach(individualValue => yargs[key](individualValue));
      } else {
        yargs[key](value);
      }
    }
  });
  return yargs.argv;
};

/**
 * @abstract
 */
export class Script {
  STATUS_CODES = {
    SUCCESS: 0,
    ERROR: 1,
  };

  logger;

  config = {};

  args;

  constructor() {
    this.logger = getLoggerInstance();
  }

  run() {
    this.parseConfig();
    this.runCommands();
  }

  parseConfig() {
    this.args = getArgs(this.config);
  }

  /**
   * @abstract
   */
  runCommands() {
    throw new Error('Any subclass of Script must implement the "runCommands" method');
  }

  logError = (message = '') => {
    this.logger.error(message);
  };

  logWarning = (message = '') => {
    this.logger.warn(message);
  };

  logSuccess = (message = '') => {
    this.logger.success(message);
  };

  logInfo = (message = '') => {
    this.logger.info(message);
  };

  logVerbose = (message = '') => {
    this.logger.verbose(message);
  };

  logDebug = (message = '') => {
    this.logger.debug(message);
  };

  log = (message = '') => {
    this.logger.verbose(message);
  };

  /**
   * @returns {boolean} True if the command exited with a success status
   */
  exec = (command, { printOutput = true } = {}) => {
    execSync(command, {
      stdio: printOutput ? 'inherit' : 'ignore',
    });
  };

  exit(success = true) {
    process.exit(success ? this.STATUS_CODES.SUCCESS : this.STATUS_CODES.ERROR);
  }

  findFolders = (path = '.') =>
    readdirSync(path, { withFileTypes: true }).filter(entry => entry.isDirectory());

  findFolderNames = path => this.findFolders(path).map(({ name }) => name);

  checkPathExists = path => existsSync(path);

  isOsWindows = () => platform() === 'win32';
}
