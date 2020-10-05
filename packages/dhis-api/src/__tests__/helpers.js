/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

/**
 * Utility that asserts that a DHIS dimension string contains members independently of their order
 * For example, `ou:ouCode1;ouCode2` is equivalent to `ou:ouCode2;ouCode1`
 */
export const assertDhisDimensionHasMembers = (dimensionString, targetMembers) => {
  const [, membersString = ''] = dimensionString.split(':');
  const foundMembers = membersString.split(';');
  expect(foundMembers).to.have.members(
    targetMembers,
    'Dimension string does not include the target members',
  );
};
