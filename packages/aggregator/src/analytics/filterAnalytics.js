/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const FILTER_TYPE_TO_METHOD = {
  EQ: (analytic, filterValue) => analytic.value == filterValue,
  GT: (analytic, filterValue) => analytic.value > filterValue,
  GE: (analytic, filterValue) => analytic.value >= filterValue,
  LT: (analytic, filterValue) => analytic.value < filterValue,
  LE: (analytic, filterValue) => analytic.value <= filterValue,
};

export const filterAnalytics = (analytics, filter = {}) => {
  let filteredAnalytics = analytics;

  Object.entries(filter).forEach(([type, filterValue]) => {
    const filterMethod = FILTER_TYPE_TO_METHOD[type];
    if (filterMethod) {
      filteredAnalytics = filteredAnalytics.filter(analytic => filterMethod(analytic, filterValue));
    }
  });

  return filteredAnalytics;
};
