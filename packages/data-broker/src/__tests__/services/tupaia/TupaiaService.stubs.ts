/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { TupaiaDataApi } from '@tupaia/data-api';
import { createJestMockInstance } from '@tupaia/utils';
import { DataBrokerModelRegistry } from '../../../types';
import { DATA_ELEMENTS } from './TupaiaService.fixtures';

export const createModelsStub = () =>
  ({
    dataSource: {
      getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
    },
  } as DataBrokerModelRegistry);

export const createTupaiaDataApiStub = ({
  fetchAnalyticsResponse = [],
  fetchEventsResponse = [],
} = {}): TupaiaDataApi =>
  createJestMockInstance('@tupaia/data-api', 'TupaiaDataApi', {
    fetchAnalytics: jest.fn().mockResolvedValue(fetchAnalyticsResponse),
    fetchEvents: jest.fn().mockResolvedValue(fetchEventsResponse),
    fetchDataElements: jest
      .fn()
      .mockImplementation(async (dataElementCodes: (keyof typeof DATA_ELEMENTS)[]) =>
        dataElementCodes.map(code => DATA_ELEMENTS[code]).filter(de => de),
      ),
  });
