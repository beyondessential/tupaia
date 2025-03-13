import { createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { DhisApi } from '@tupaia/dhis-api';
import { createJestMockInstance } from '@tupaia/utils';
import * as GetDhisApi from '../../../services/dhis/getDhisApi';
import { DhisAnalytics, DhisEventAnalytics } from '../../../services/dhis/types';
import { Analytic, DataBrokerModelRegistry, Event } from '../../../types';
import {
  DATA_ELEMENTS_BY_GROUP,
  DHIS_RESPONSE_DATA_ELEMENTS,
  DATA_ELEMENTS,
  DATA_GROUPS,
  ENTITIES,
  SERVER_NAME,
  ENTITY_HIERARCHIES,
} from './DhisService.fixtures';

type MockDhisApiData = Partial<{
  getAnalyticsResponse: DhisAnalytics;
  getEventsResponse: Event[];
  getEventAnalyticsStub: (
    query: Parameters<DhisApi['getEventAnalytics']>[0],
  ) => Promise<DhisEventAnalytics>;
  serverName: string;
}>;

const defaultAnalytics: DhisAnalytics = {
  headers: [],
  metaData: { items: {}, dimensions: {} },
  rows: [],
};

export const createMockDhisApi = ({
  getAnalyticsResponse = defaultAnalytics,
  getEventsResponse = [],
  getEventAnalyticsStub = async () => defaultAnalytics,
  serverName = SERVER_NAME,
}: MockDhisApiData = {}): DhisApi => {
  return createJestMockInstance('@tupaia/dhis-api', 'DhisApi', {
    getAnalytics: jest.fn().mockResolvedValue(getAnalyticsResponse),
    getEvents: jest.fn().mockResolvedValue(getEventsResponse),
    getEventAnalytics: jest.fn(getEventAnalyticsStub),
    fetchDataElements: jest
      .fn()
      .mockImplementation(async (codes: (keyof typeof DHIS_RESPONSE_DATA_ELEMENTS)[]) =>
        codes.map(
          code => ({ code, id: DHIS_RESPONSE_DATA_ELEMENTS[code].uid, valueType: 'NUMBER' }),
          {},
        ),
      ),
    getResourceTypes: jest.fn().mockReturnValue({ DATA_ELEMENT: 'dataElement' }),
    serverName,
  });
};

export const stubGetDhisApi = (mockDhisApi: DhisApi) => {
  // Mock return value of all getDhisApi functions to return this mock api
  jest.spyOn(GetDhisApi, 'getApiForDataSource').mockResolvedValue(mockDhisApi);
  jest.spyOn(GetDhisApi, 'getApisForDataSources').mockResolvedValue([mockDhisApi]);
  jest.spyOn(GetDhisApi, 'getApiFromServerName').mockResolvedValue(mockDhisApi);
};

export const createModelsStub = (): DataBrokerModelRegistry => {
  return baseCreateModelsStub({
    dataElement: {
      records: Object.values(DATA_ELEMENTS),
      extraMethods: {
        getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
        getDhisDataTypes: () => ({ DATA_ELEMENT: 'DataElement', INDICATOR: 'Indicator' }),
      },
    },
    dataGroup: {
      records: Object.values(DATA_GROUPS),
      extraMethods: {
        getDataElementsInDataGroup: async (groupCode: string) =>
          DATA_ELEMENTS_BY_GROUP[groupCode as keyof typeof DATA_ELEMENTS_BY_GROUP],
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
export const buildDhisAnalyticsResponse = (analytics: Analytic[]): DhisAnalytics => {
  const rows = analytics.map(({ dataElement, organisationUnit, period, value }) => [
    dataElement,
    organisationUnit,
    period,
    value?.toString() ?? null,
  ]);
  const dataElementsInAnalytics = analytics.map(({ dataElement }) => dataElement);
  const items = dataElementsInAnalytics
    .map(dataElement => {
      const { dataElementCode: dhisCode } =
        DATA_ELEMENTS[dataElement as keyof typeof DATA_ELEMENTS];
      return DHIS_RESPONSE_DATA_ELEMENTS[dhisCode as keyof typeof DHIS_RESPONSE_DATA_ELEMENTS];
    })
    .reduce((itemAgg, { uid, code, name }) => {
      const newItem = { uid, code, name, dimensionItemType: 'DATA_ELEMENT' };
      return { ...itemAgg, [uid]: newItem };
    }, {});
  const dimensions = { dx: Object.keys(items), co: [] };

  return {
    headers: [
      { name: 'dx', column: 'Data', valueType: 'TEXT' },
      { name: 'ou', column: 'Organisation unit', valueType: 'TEXT' },
      { name: 'pe', column: 'Period', valueType: 'TEXT' },
      { name: 'value', column: 'Value', valueType: 'NUMBER' },
    ],
    rows,
    metaData: { items, dimensions },
  };
};
