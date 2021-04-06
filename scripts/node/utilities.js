/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const { exec } = require('child_process');
const { promisify } = require('util');

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
  executeCommand,
  executeAllCommands,
};
