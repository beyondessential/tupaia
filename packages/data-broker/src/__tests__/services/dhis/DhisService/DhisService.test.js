/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testDelete } from './testDelete';
import { testPull } from './testPull';
import { testPush } from './testPush';

describe('DhisService', () => {
  describe('push()', testPush);

  describe('delete()', testDelete);

  describe('pull()', testPull);
});
