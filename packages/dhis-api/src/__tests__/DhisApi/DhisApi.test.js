/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testCodesToIds } from './testCodesToIds';
import { testProgramCodeToId } from './testProgramCodeToId';
import { testGetEvents } from './testGetEvents';
import { testGetEventAnalytics } from './testGetEventAnalytics';

describe('DhisApi', () => {
  describe('codesToIds()', testCodesToIds);

  describe('programCodeToId()', testProgramCodeToId);

  describe('getEvents()', testGetEvents);

  describe('getEventAnalytics()', testGetEventAnalytics);
});
