/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import fs from 'fs';
import { TestResult } from './types';

export const LOGS_DIR = 'logs';

export const writeLogFile = (result: TestResult) => {
  let fileContents = '';

  const { successes, errors, skipped } = result;

  if (successes > 0) {
    fileContents = fileContents.concat(`successes: ${successes}\n\n`);
  }

  if (errors.length > 0) {
    fileContents = fileContents.concat(`errors:`);
    errors.forEach(error => (fileContents = fileContents.concat(`\n  ${error}`)));
    fileContents = fileContents.concat(`\n\n`);
  }

  if (skipped.length > 0) {
    fileContents = fileContents.concat(`skipped:`);
    skipped.forEach(skip => (fileContents = fileContents.concat(`\n  ${skip}`)));
    fileContents = fileContents.concat(`\n\n`);
  }

  const fileName = `results_${new Date().getTime()}.log`;
  const filePath = `${LOGS_DIR}/${fileName}`;

  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR);
  }

  fs.writeFileSync(filePath, fileContents);
  return filePath;
};
