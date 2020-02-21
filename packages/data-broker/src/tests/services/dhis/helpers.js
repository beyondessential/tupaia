/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';

import { DhisApi } from '@tupaia/dhis-api';
import * as GetDhisApiInstance from '../../../services/dhis/getDhisApiInstance';
import {
  DATA_ELEMENTS_BY_GROUP,
  DATA_ELEMENT_CODE_TO_ID,
  DATA_SOURCES,
  SERVER_NAME,
} from './DhisService.fixtures';

export const setupDhisApiForStubbing = () => {
  sinon.stub(GetDhisApiInstance, 'getDhisApiInstance');
};

const defaultAnalytics = {
  headers: [],
  rows: [],
  metaData: { items: {}, dimensions: [] },
};

export const stubDhisApi = ({
  getAnalyticsResponse = defaultAnalytics,
  getEventsResponse = [],
} = {}) => {
  const dhisApi = sinon.createStubInstance(DhisApi, {
    getAnalytics: getAnalyticsResponse,
    getEvents: getEventsResponse,
    getIdsFromCodes: sinon
      .stub()
      .callsFake((_, codes) => codes.map(c => DATA_ELEMENT_CODE_TO_ID[c])),
    getServerName: SERVER_NAME,
    getResourceTypes: { DATA_ELEMENT: 'dataElement' },
  });
  GetDhisApiInstance.getDhisApiInstance.returns(dhisApi);
  return dhisApi;
};

export const cleanupDhisApiStub = () => {
  GetDhisApiInstance.getDhisApiInstance.restore();
};

export const stubModels = () => ({
  dataSource: {
    findOrDefault: specs =>
      Object.values(DATA_SOURCES).filter(
        ({ code, type }) => specs.code.includes(code) && specs.type === type,
      ),
    getDataElementsInGroup: groupCode => DATA_ELEMENTS_BY_GROUP[groupCode],
    getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
  },
});
