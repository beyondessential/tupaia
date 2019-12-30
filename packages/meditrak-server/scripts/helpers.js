/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { exec } from 'child_process';
import { promisify } from 'util';

export const executeCommand = async command => {
  const { stdout } = await promisify(exec)(command);
  return stdout;
};

/**
 * Executes all the provided commands in order, exiting as soon as one of them fails
 *
 * @param {string[]} commands
 */
export const executeAllCommands = async commands => executeCommand(commands.join(' && '));
