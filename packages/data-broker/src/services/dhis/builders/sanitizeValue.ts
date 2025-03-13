import { NUMBER } from '../dhisValueTypes';
import { ValueType } from '../types';

export const sanitizeValue = (
  value: string | number | null,
  valueType?: ValueType,
): string | number | null => {
  if (value === null) return null;
  if (valueType === NUMBER) {
    const sanitizedValue = Number.parseFloat(value as string);
    return Number.isNaN(sanitizedValue) ? '' : sanitizedValue;
  }

  return value;
};
