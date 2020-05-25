/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';

import { DhisApi } from '@tupaia/dhis-api';
import * as GetDhisApiInstance from '../../../../services/dhis/getDhisApiInstance';
import {
  DATA_ELEMENTS_BY_GROUP,
  DATA_ELEMENTS,
  DATA_SOURCES,
  SERVER_NAME,
} from './DhisService.fixtures';

export const setupDhisApiForStubbing = () => {
  sinon.stub(GetDhisApiInstance, 'getDhisApiInstance');
};

const defaultAnalytics = {
  headers: [],
  metaData: { items: {}, dimensions: [] },
  width: 0,
  height: 0,
  rows: [],
};

export const stubDhisApi = ({
  getAnalyticsResponse = defaultAnalytics,
  getEventsResponse = [],
  getEventAnalyticsResponse = defaultAnalytics,
} = {}) => {
  const dhisApi = sinon.createStubInstance(DhisApi, {
    getAnalytics: sinon.stub().resolves(getAnalyticsResponse),
    getEvents: sinon.stub().resolves(getEventsResponse),
    getEventAnalytics: sinon.stub().resolves(getEventAnalyticsResponse),
    fetchDataElements: sinon
      .stub()
      .callsFake(async codes =>
        codes.map(code => ({ code, id: DATA_ELEMENTS[code].uid, valueType: 'NUMBER' }), {}),
      ),
    getServerName: SERVER_NAME,
    getResourceTypes: { DATA_ELEMENT: 'dataElement' },
  });
  GetDhisApiInstance.getDhisApiInstance.returns(dhisApi);
  return dhisApi;
};

export const cleanupDhisApiStub = () => {
  GetDhisApiInstance.getDhisApiInstance.restore();
};

export const createModelsStub = () => ({
  dataSource: {
    findOrDefault: async specs =>
      Object.values(DATA_SOURCES).filter(
        ({ code, type }) => specs.code.includes(code) && specs.type === type,
      ),
    getDataElementsInGroup: async groupCode => DATA_ELEMENTS_BY_GROUP[groupCode],
    getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
  },
});

/**
 * Reverse engineers the DHIS2 aggregate data response given the expected analytics
 */
export const buildDhisAnalyticsResponse = analytics => {
  const rows = analytics.map(({ dataElement, organisationUnit, period, value }) => [
    dataElement,
    organisationUnit,
    period,
    value,
  ]);
  const dataElementsInAnalytics = analytics.map(({ dataElement }) => dataElement);
  const items = dataElementsInAnalytics
    .map(dataElement => {
      const { dataElementCode: dhisCode } = DATA_SOURCES[dataElement];
      return DATA_ELEMENTS[dhisCode];
    })
    .reduce((itemAgg, { uid, code, name }) => {
      const newItem = { uid, code, name, dimensionItemType: 'DATA_ELEMENT' };
      return { ...itemAgg, [uid]: newItem };
    }, {});
  const dimensions = { dx: Object.keys(items), co: [] };

  return {
    headers: [
      { name: 'dx', valueType: 'TEXT' },
      { name: 'ou', valueType: 'TEXT' },
      { name: 'pe', valueType: 'TEXT' },
      { name: 'value', valueType: 'NUMBER' },
    ],
    rows,
    metaData: { items, dimensions },
  };
};
