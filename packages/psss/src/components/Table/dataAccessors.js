/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export const createTotalCasesAccessor = key => rowData => {
  const syndrome = rowData.syndromes.find(i => i.id === key);
  return syndrome ? syndrome.totalCases : null;
};

export const createPercentageChangeAccessor = key => rowData => {
  const syndrome = rowData.syndromes.find(i => i.id === key);
  return syndrome ? syndrome.percentageChange : null;
};
