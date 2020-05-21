/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { cleanupDhisApiStub, setupDhisApiForStubbing } from './DhisService.stubs';
import { testDelete } from './testDelete';
import { testPull } from './testPull';
import { testPush } from './testPush';

describe('DhisService', () => {
  before(() => {
    setupDhisApiForStubbing();
  });

  after(() => {
    cleanupDhisApiStub();
  });

  describe('push()', testPush);

  describe('delete()', testDelete);

  describe('pull()', testPull);
});
