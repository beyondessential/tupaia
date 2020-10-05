/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { testUpdateValues } from './testUpdateValues';
import { testRemoveArrayValues } from './testRemoveArrayValues';
import { testReplaceArrayValue } from './testReplaceArrayValue';

describe('migrationUtilities', () => {
  describe('updateValues', testUpdateValues);

  describe('removeArrayValue', testRemoveArrayValues);

  describe('replaceArrayValue', testReplaceArrayValue);
});
