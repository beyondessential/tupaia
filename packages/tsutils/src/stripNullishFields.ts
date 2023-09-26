/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { isNotNullish } from './typeGuards';

export const stripNullishFields = <T extends Record<string, unknown>>(obj: T) => {
  const objWithoutNullishFields: T = { ...obj };
  Object.entries(obj).forEach(([key, value]) => {
    if (!isNotNullish(value)) {
      delete objWithoutNullishFields[key];
    }
  });
  return objWithoutNullishFields;
};
