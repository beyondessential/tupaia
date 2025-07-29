import { startCase } from 'es-toolkit/compat';
import * as fns from 'date-fns';

// We use the `'undefined'` string to indicate a missing value in cases where the
// actual `undefined` JS type cannot be used, e.g. in json config persisted in the DB
const isUndefined = value => value !== undefined && value !== 'undefined';

const average = (...argumentList) => {
  const existingValues = argumentList.filter(isUndefined);
  const sum = existingValues.reduce((a, b) => a + b, 0);
  const res = sum / existingValues.length;
  return res;
};

const firstExistingValue = (...argumentList) => {
  for (const value of argumentList) {
    if (isUndefined(value)) {
      return value;
    }
  }

  return undefined; // Should make sure that at least 1 value exists
};

const translate = (value, translations) => {
  return translations[value];
};

const date = (...argumentList) => new Date(...argumentList);

const dateToString = date => fns.format(date, 'yyyy-MM-dd');

const upperFirstCase = value => {
  return startCase(value);
};

export const customFunctions = {
  avg: average,
  firstExistingValue,
  translate,
  date,
  dateToString,
  upperFirstCase,
};
