/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { testCategories } from './testCategories';
import { testNoCategories } from './testNoCategories';
import { testOrgUnitCategories } from './testOrgUnitCategories';

describe('tableOfDataValues', () => {
  describe('no categories', testNoCategories);

  describe('categories', testCategories);

  describe('org unit categories', testOrgUnitCategories);
});
