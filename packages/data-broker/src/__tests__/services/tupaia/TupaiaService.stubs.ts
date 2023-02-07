/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import type { TupaiaDataApi } from '@tupaia/data-api';
import { createJestMockInstance } from '@tupaia/utils';
import { Analytic, Event } from '../../../types';

export const createModelsStub = () => {
  return baseCreateModelsStub({
    dataSource: {
      records: [],
      extraMethods: {
        getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
      },
    },
  });
};

export const createTupaiaDataApiStub = ({
  fetchAnalyticsResponse,
  fetchEventsResponse,
}: {
  fetchAnalyticsResponse: { analytics: Analytic[] };
  fetchEventsResponse: Event[];
}): TupaiaDataApi =>
  createJestMockInstance('@tupaia/data-api', 'TupaiaDataApi', {
    fetchAnalytics: jest.fn().mockResolvedValue(fetchAnalyticsResponse),
    fetchEvents: jest.fn().mockResolvedValue(fetchEventsResponse),
  });
