import { Row, FieldValue } from '../../../reportBuilder';

const isUndefined = (value: FieldValue): value is undefined => {
  return value === undefined;
};

const group = (existingRow: Row, field: string, value: FieldValue) => {
  existingRow[field] = value;
};

const sum = (existingRow: Row, field: string, value: FieldValue) => {
  if (typeof value === 'number') {
    existingRow[field] = ((existingRow[field] as number) || 0) + value;
  } else {
    throw new Error(`Expected number, got '${typeof value}'.`);
  }
};

const count = (existingRow: Row, field: string, value: FieldValue) => {
  existingRow[field] = ((existingRow[field] as number) || 0) + 1;
};

const max = (existingRow: Row, field: string, value: FieldValue) => {
  const existingValue: FieldValue = existingRow[field];
  if (!isUndefined(value)) {
    if (isUndefined(existingValue)) {
      existingRow[field] = value;
    } else if (value > existingValue) {
      existingRow[field] = value;
    }
  }
};

const min = (existingRow: Row, field: string, value: FieldValue) => {
  const existingValue: FieldValue = existingRow[field];
  if (!isUndefined(value)) {
    if (isUndefined(existingValue)) {
      existingRow[field] = value;
    } else if (value < existingValue) {
      existingRow[field] = value;
    }
  }
};

const unique = (existingRow: Row, field: string, value: FieldValue) => {
  if (existingRow[field] !== undefined && existingRow[field] !== value) {
    existingRow[field] = 'NO_UNIQUE_VALUE';
  } else {
    existingRow[field] = value;
  }
};

const drop = (existingRow: Row, field: string, value: FieldValue) => {
  // Do nothing, don't add the field to the existing row
};

const last = (existingRow: Row, field: string, value: FieldValue) => {
  existingRow[field] = value;
};

export const aggregations = {
  group,
  sum,
  count,
  max,
  min,
  unique,
  drop,
  last,
  default: last,
};
