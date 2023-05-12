/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { NUMBER } from '../dhisValueTypes';
import { ValueType } from '../types';

export const sanitizeValue = (value: string | number, valueType?: ValueType): string | number => {
  if (valueType === NUMBER) {
    const sanitizedValue = parseFloat(value as string);
    return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
  }

  return value;
};
