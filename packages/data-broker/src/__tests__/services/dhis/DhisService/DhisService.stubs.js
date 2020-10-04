/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisApi } from '@tupaia/dhis-api';
import { getDhisApiInstance } from '../../../../services/dhis/getDhisApiInstance';
import {
  DATA_ELEMENTS_BY_GROUP,
  DATA_ELEMENTS,
  DATA_SOURCES,
  SERVER_NAME,
} from './DhisService.fixtures';

jest.mock('../../../../services/dhis/getDhisApiInstance');
jest.mock('@tupaia/dhis-api');
// const originalDhisApiModule = jest.requireActual('@tupaia/dhis-api');

// export const setupDhisApiForStubbing = () => {
//   jest.doMock('../../../../services/dhis/getDhisApiInstance');
// };

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
  // jest.doMock('@tupaia/dhis-api', () => {
  //   const originalDhisApiModule = jest.requireActual('@tupaia/dhis-api');
  //
  //   return {
  //     __esModule: true,
  //     ...originalDhisApiModule,
  //     getAnalytics: jest.fn().mockResolvedValue(getAnalyticsResponse),
  //     getEvents: jest.fn().mockResolvedValue(getEventsResponse),
  //     getEventAnalytics: jest.fn().mockResolvedValue(getEventAnalyticsResponse),
  //     fetchDataElements: jest
  //       .fn()
  //       .mockImplementation(async codes =>
  //         codes.map(code => ({ code, id: DATA_ELEMENTS[code].uid, valueType: 'NUMBER' }), {}),
  //       ),
  //     getServerName: SERVER_NAME,
  //     getResourceTypes: { DATA_ELEMENT: 'dataElement' },
  //   };
  // });
  const dhisApi = new DhisApi();
  dhisApi.getAnalytics = jest.fn().mockResolvedValue(getAnalyticsResponse);
  dhisApi.getEvents = jest.fn().mockResolvedValue(getEventsResponse);
  dhisApi.getEventAnalytics = jest.fn().mockResolvedValue(getEventAnalyticsResponse);
  dhisApi.fetchDataElements = jest
    .fn()
    .mockImplementation(async codes =>
      codes.map(code => ({ code, id: DATA_ELEMENTS[code].uid, valueType: 'NUMBER' }), {}),
    );
  dhisApi.getServerName = jest.fn().mockReturnValue(SERVER_NAME);
  dhisApi.getResourceTypes = jest.fn().mockReturnValue({ DATA_ELEMENT: 'dataElement' });
  jest.spyOn(dhisApi, 'postDataValueSets');
  jest.spyOn(dhisApi, 'postEvents');
  jest.spyOn(dhisApi, 'getEvents');
  getDhisApiInstance.mockReturnValue(dhisApi);
  return dhisApi;
};

export const cleanupDhisApiStub = () => {
  getDhisApiInstance.mockReset();
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
