/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import yargs from 'yargs';

import { getLoggerInstance } from './getLoggerInstance';

export const runScriptSync = (script, cleanup) => {
  const logger = getLoggerInstance();
  let exitCode = 0;

  try {
    script();
  } catch (error) {
    exitCode = 1;
    logger.error(error.stack);
  } finally {
    if (cleanup) {
      cleanup();
    }
  }

  if (exitCode === 0) {
    logger.success('Done!');
  }
  process.exit(exitCode);
};

export const runScript = (script, cleanup) => {
  const logger = getLoggerInstance();

  script()
    .catch(error => {
      logger.error(error.stack);
      process.exit(1);
    })
    .then(() => {
      logger.success('Done!');
      process.exit(0);
    })
    .finally(() => {
      if (cleanup) {
        cleanup();
      }
    });
};

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
  const allowedYargsKeys = ['command', 'options', 'usage', 'version'];

  yargs.strict();
  Object.entries(scriptConfig).forEach(([key, value]) => {
    if (allowedYargsKeys.includes(key)) {
      yargs[key](value);
    }
  });
  return yargs.argv;
};
