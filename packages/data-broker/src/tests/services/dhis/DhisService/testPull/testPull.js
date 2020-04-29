/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testPullAnalytics } from './testPullAnalytics';
import { testPullEvents } from './testPullEvents';
import { testPullEvents_Deprecated } from './testPullEvents_Deprecated';

export const testPull = () => {
  describe('analytics', testPullAnalytics);

  describe('events', testPullEvents);

  describe('events - deprecated API', testPullEvents_Deprecated);
};
