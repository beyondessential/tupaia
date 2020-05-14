/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';
import { TupaiaDataApi } from '@tupaia/data-api';
import { DATA_ELEMENTS } from './TupaiaDataService.fixtures';

export const createModelsStub = () => ({
  dataSource: {
    getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
  },
});

export const createTupaiaDataApiStub = ({
  getAnalyticsResponse = [],
  getEventsResponse = [],
} = {}) =>
  sinon.createStubInstance(TupaiaDataApi, {
    getAnalytics: sinon.stub().resolves(getAnalyticsResponse),
    getEvents: sinon.stub().resolves(getEventsResponse),
    fetchDataElements: sinon
      .stub()
      .callsFake(async dataElementCodes =>
        dataElementCodes.map(code => DATA_ELEMENTS[code]).filter(de => de),
      ),
  });
