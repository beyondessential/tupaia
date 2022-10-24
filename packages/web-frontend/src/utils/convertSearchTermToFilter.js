/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const convertSearchTermToFilter = (unprocessedFilterObject = {}) => {
  const filterObject = {};
  Object.entries(unprocessedFilterObject).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      filterObject[key] = value;
      return;
    }

    filterObject[key] = {
      comparator: `ilike`,
      comparisonValue: `%${value}%`,
      castAs: 'text',
    };
  });
  return filterObject;
};
