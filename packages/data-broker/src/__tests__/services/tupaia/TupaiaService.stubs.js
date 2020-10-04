/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDataApi } from '@tupaia/data-api';
import { DATA_ELEMENTS } from './TupaiaService.fixtures';

jest.mock('@tupaia/data-api');

export const createModelsStub = () => ({
  dataSource: {
    getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
  },
});

export const createTupaiaDataApiStub = ({
  fetchAnalyticsResponse = [],
  fetchEventsResponse = [],
} = {}) => {
  TupaiaDataApi.fetchAnalytics = jest.fn().mockResolvedValue(fetchAnalyticsResponse);
  TupaiaDataApi.fetchEvents = jest.fn().mockResolvedValue(fetchEventsResponse);
  TupaiaDataApi.fetchDataElements = jest
    .fn()
    .mockImplementation(async dataElementCodes =>
      dataElementCodes.map(code => DATA_ELEMENTS[code]).filter(de => de),
    );
  return TupaiaDataApi;
};
