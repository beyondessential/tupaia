/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';
import { TupaiaDataApi } from '@tupaia/data-api';
import { DATA_ELEMENTS } from './TupaiaService.fixtures';

export const createModelsStub = () => ({
  dataSource: {
    getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
  },
});

export const createTupaiaDataApiStub = ({
  fetchAnalyticsResponse = [],
  fetchEventsResponse = [],
} = {}) =>
  sinon.createStubInstance(TupaiaDataApi, {
    fetchAnalytics: sinon.stub().resolves(fetchAnalyticsResponse),
    fetchEvents: sinon.stub().resolves(fetchEventsResponse),
    fetchDataElements: sinon
      .stub()
      .callsFake(async dataElementCodes =>
        dataElementCodes.map(code => DATA_ELEMENTS[code]).filter(de => de),
      ),
  });
