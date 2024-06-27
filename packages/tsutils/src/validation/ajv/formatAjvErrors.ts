/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { ErrorObject } from 'ajv';

const ERROR_PREFIX = 'Validation Error';
const ERROR_LINE_SEPARATOR = '\n  ';

const formatInstancePath = (instancePath: string) =>
  !instancePath
    ? ''
    : `${instancePath
        .split('/')
        .filter(part => part !== '')
        .join('.')}: `;

const formatAjvError = (error: ErrorObject) =>
  `${formatInstancePath(error.instancePath)}${error.message}`;

export const formatAjvErrors = (errors: ErrorObject[]) => {
  if (errors.length === 0) {
    return ERROR_PREFIX;
  }

  if (errors.length === 1) {
    return `${ERROR_PREFIX}: ${formatAjvError(errors[0])}`;
  }

  return `${ERROR_PREFIX}:${ERROR_LINE_SEPARATOR}${errors
    .map(error => formatAjvError(error))
    .join(ERROR_LINE_SEPARATOR)}`;
};
