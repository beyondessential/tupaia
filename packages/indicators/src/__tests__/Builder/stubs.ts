/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { Analytic } from '../../types';

export const createAnalyticsRepository = (availableAnalytics: Analytic[]) =>
  createJestMockInstance('@tupaia/indicators/src/AnalyticsRepository.ts', 'AnalyticsRepository', {
    getAggregatedAnalytics: (dataElement: string) =>
      availableAnalytics.filter(a => a.dataElement === dataElement),
  });
