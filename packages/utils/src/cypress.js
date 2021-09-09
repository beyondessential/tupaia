/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export const requireCyEnv = variable => {
  const unprefixedVariable = variable.replace(/^CYPRESS_/, '');
  const value = Cypress.env(unprefixedVariable);
  if (value === undefined) {
    throw new Error(`Could not load Cypress env variable 'CYPRESS_${unprefixedVariable}'`);
  }
  return value;
};
