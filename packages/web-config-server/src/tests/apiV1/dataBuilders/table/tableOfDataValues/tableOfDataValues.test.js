/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { testCategories } from './testCategories';
import { testNoCategories } from './testNoCategories';
import { testOrgUnitCategories } from './testOrgUnitCategories';
import { testTotals } from './testTotals';

describe('tableOfDataValues', () => {
  describe('no categories', testNoCategories);

  describe('categories', testCategories);

  describe('org unit categories', testOrgUnitCategories);

  describe('totals', testTotals);
});
