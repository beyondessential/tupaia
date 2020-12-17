/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const validateIsNumber = (
  value: unknown,
  errorHandler: (value: unknown) => Error,
): number => {
  if (typeof value !== 'number') {
    throw errorHandler(value);
  }

  return value;
};
