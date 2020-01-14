/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 **/

export const filterAnalyticsResults = (results, measureCriteria) => {
  let filteredResults = results;

  const { EQ, GT, GE, LT, LE } = measureCriteria || {};
  if (EQ) {
    // eslint-disable-next-line eqeqeq
    filteredResults = filteredResults.filter(r => r.value == EQ);
  }
  if (GT) {
    filteredResults = filteredResults.filter(r => r.value > GT);
  }
  if (GE) {
    filteredResults = filteredResults.filter(r => r.value >= GE);
  }
  if (LT) {
    filteredResults = filteredResults.filter(r => r.value < LT);
  }
  if (LE) {
    filteredResults = filteredResults.filter(r => r.value <= LE);
  }

  return filteredResults;
};
