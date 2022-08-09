/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { DATA_ELEMENTS } from './TupaiaService.fixtures';
import { createJestMockInstance } from '../../../../../utils/src/testUtilities';

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
  fetchAnalyticsResponse = [],
  fetchEventsResponse = [],
} = {}) =>
  createJestMockInstance('@tupaia/data-api', 'TupaiaDataApi', {
    fetchAnalytics: jest.fn().mockResolvedValue(fetchAnalyticsResponse),
    fetchEvents: jest.fn().mockResolvedValue(fetchEventsResponse),
    fetchDataElements: jest
      .fn()
      .mockImplementation(async dataElementCodes =>
        dataElementCodes.map(code => DATA_ELEMENTS[code]).filter(de => de),
      ),
  });
