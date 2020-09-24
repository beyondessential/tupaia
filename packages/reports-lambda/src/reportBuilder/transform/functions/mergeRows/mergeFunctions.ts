const group = (existingRow, field, value) => {
  existingRow[field] = value;
};

const sum = (existingRow, field, value) => {
  existingRow[field] = (existingRow[field] || 0) + value;
};

const count = (existingRow, field, value) => {
  existingRow[field] = (existingRow[field] || 0) + 1;
};

const max = (existingRow, field, value) => {
  if (value > existingRow[field]) {
    existingRow[field] = value;
  }
};

const min = (existingRow, field, value) => {
  if (value < existingRow[field]) {
    existingRow[field] = value;
  }
};

const unique = (existingRow, field, value) => {
  if (existingRow[field] !== undefined && existingRow[field] !== value) {
    existingRow[field] = 'NO_UNIQUE_VALUE';
  } else {
    existingRow[field] = value;
  }
};

const drop = (existingRow, field, value) => {
  // Do nothing, don't add the field to the existing row
};

const latest = (existingRow, field, value) => {
  existingRow[field] = value;
};

export const mergeFunctions = {
  group,
  sum,
  count,
  max,
  min,
  unique,
  drop,
  latest,
  default: latest,
};
