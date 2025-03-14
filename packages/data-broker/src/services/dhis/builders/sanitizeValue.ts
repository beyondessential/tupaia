import { NUMBER } from '../dhisValueTypes';
import { ValueType } from '../types';

export const sanitizeValue = (value: string | number, valueType?: ValueType): string | number => {
  if (valueType === NUMBER) {
    const sanitizedValue = Number.parseFloat(value as string);
    return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
  }

  return value;
};
