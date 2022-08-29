/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import * as GetDhisApi from '../../../services/dhis/getDhisApi';
import {
  DATA_ELEMENTS_BY_GROUP,
  DHIS_RESPONSE_DATA_ELEMENTS,
  DATA_SOURCES,
  DATA_GROUPS,
  ENTITIES,
  SERVER_NAME,
  ENTITY_HIERARCHIES,
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
  getEventAnalyticsStub,
  getEventAnalyticsResponse = defaultAnalytics,
  serverName = SERVER_NAME,
} = {}) => {
  return createJestMockInstance('@tupaia/dhis-api', 'DhisApi', {
    getAnalytics: jest.fn().mockResolvedValue(getAnalyticsResponse),
    getEvents: jest.fn().mockResolvedValue(getEventsResponse),
    getEventAnalytics: getEventAnalyticsStub
      ? jest.fn(getEventAnalyticsStub)
      : jest.fn().mockResolvedValue(getEventAnalyticsResponse),
    fetchDataElements: jest
      .fn()
      .mockImplementation(async codes =>
        codes.map(
          code => ({ code, id: DHIS_RESPONSE_DATA_ELEMENTS[code].uid, valueType: 'NUMBER' }),
          {},
        ),
      ),
    getResourceTypes: jest.fn().mockReturnValue({ DATA_ELEMENT: 'dataElement' }),
    serverName,
  });
};

export const stubGetDhisApi = mockDhisApi => {
  // Mock return value of all getDhisApi functions to return this mock api
  jest.spyOn(GetDhisApi, 'getApiForDataSource').mockReturnValue(mockDhisApi);
  jest.spyOn(GetDhisApi, 'getApisForDataSources').mockReturnValue([mockDhisApi]);
  jest.spyOn(GetDhisApi, 'getApisForLegacyDataSourceConfig').mockReturnValue([mockDhisApi]);
  jest.spyOn(GetDhisApi, 'getApiFromServerName').mockReturnValue(mockDhisApi);
};

export const createModelsStub = () => {
  return baseCreateModelsStub({
    dataElement: {
      records: Object.values(DATA_SOURCES),
      extraMethods: {
        getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
        getDhisDataTypes: () => ({ DATA_ELEMENT: 'DataElement', INDICATOR: 'Indicator' }),
      },
    },
    dataGroup: {
      records: Object.values(DATA_GROUPS),
      extraMethods: {
        getDataElementsInDataGroup: async groupCode => DATA_ELEMENTS_BY_GROUP[groupCode],
      },
    },
    entity: {
      records: Object.values(ENTITIES),
    },
    entityHierarchy: {
      records: Object.values(ENTITY_HIERARCHIES),
    },
  });
};

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
      return DHIS_RESPONSE_DATA_ELEMENTS[dhisCode];
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
