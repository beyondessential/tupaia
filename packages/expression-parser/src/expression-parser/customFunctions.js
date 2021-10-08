/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const average = (...argumentList) => {
  const existingValues = argumentList.filter(a => a !== 'undefined');
  const sum = existingValues.reduce((a, b) => a + b, 0);
  return sum / existingValues.length;
};

const firstExistingValue = (...argumentList) => {
  for (const value of argumentList) {
    if (value !== 'undefined') {
      return value;
    }
  }

  return undefined; // Should make sure that at least 1 value exists
};

const translate = (value, translations) => {
  return translations[value];
};

const date = (...argumentList) => new Date(...argumentList);

export const customFunctions = {
  avg: average,
  firstExistingValue,
  translate,
  date,
};
