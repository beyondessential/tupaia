/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import * as GetDhisApi from '../../../services/dhis/getDhisApi';
import {
  DATA_ELEMENTS_BY_GROUP,
  DATA_ELEMENTS,
  DATA_SOURCES,
  SERVER_NAME,
} from './DhisService.fixtures';
import { createJestMockInstance } from '../../../../../utils/src/testUtilities';

const defaultAnalytics = {
  headers: [],
  metaData: { items: {}, dimensions: [] },
  width: 0,
  height: 0,
  rows: [],
};

export const createMockDhisApi = ({
  getAnalyticsResponse = defaultAnalytics,
  getEventsResponse = [],
  getEventAnalyticsResponse = defaultAnalytics,
  serverName = SERVER_NAME,
} = {}) => {
  return createJestMockInstance('@tupaia/dhis-api', 'DhisApi', {
    getAnalytics: jest.fn().mockResolvedValue(getAnalyticsResponse),
    getEvents: jest.fn().mockResolvedValue(getEventsResponse),
    getEventAnalytics: jest.fn().mockResolvedValue(getEventAnalyticsResponse),
    fetchDataElements: jest
      .fn()
      .mockImplementation(async codes =>
        codes.map(code => ({ code, id: DATA_ELEMENTS[code].uid, valueType: 'NUMBER' }), {}),
      ),
    getResourceTypes: jest.fn().mockReturnValue({ DATA_ELEMENT: 'dataElement' }),
    serverName,
  });
};

export const stubGetDhisApi = mockDhisApi => {
  // Mock return value of all getDhisApi functions to return this mock api
  jest.spyOn(GetDhisApi, 'getApiForValue').mockReturnValue(mockDhisApi);
  jest.spyOn(GetDhisApi, 'getApisForDataSources').mockReturnValue([mockDhisApi]);
  jest.spyOn(GetDhisApi, 'getApisForLegacyDataSourceConfig').mockReturnValue([mockDhisApi]);
  jest.spyOn(GetDhisApi, 'getApiFromServerName').mockReturnValue(mockDhisApi);
};

export const createModelsStub = () => ({
  dataSource: createDataSourceModelsStub(),
});

export const createDataSourceModelsStub = () => ({
  find: async specs =>
    Object.values(DATA_SOURCES).filter(
      ({ code, type }) => specs.code.includes(code) && specs.type === type,
    ),
  getDataElementsInGroup: async groupCode => DATA_ELEMENTS_BY_GROUP[groupCode],
  getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
  getDhisDataTypes: () => ({ DATA_ELEMENT: 'DataElement', INDICATOR: 'Indicator' }),
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
