/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
export const createTotalCasesAccessor = key => rowData => {
  const indicator = rowData.indicators.find(i => i.id === key);
  return indicator ? indicator.totalCases : null;
};
