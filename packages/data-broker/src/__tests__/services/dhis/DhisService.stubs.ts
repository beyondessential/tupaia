/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { DhisApi } from '@tupaia/dhis-api';
import { createJestMockInstance } from '@tupaia/utils';
import * as GetDhisApiInstance from '../../../services/dhis/getDhisApiInstance';
import { DhisAnalytics, DhisEventAnalytics } from '../../../services/dhis/types';
import { Analytic, DataBrokerModelRegistry, Event } from '../../../types';
import {
  DATA_ELEMENTS_BY_GROUP,
  DATA_ELEMENT_METADATA,
  DATA_ELEMENTS,
  DATA_GROUPS,
  SERVER_NAME,
} from './DhisService.fixtures';

type DhisApiStubResponses = Partial<{
  getAnalyticsResponse: DhisAnalytics;
  getEventsResponse: Event[];
  getEventAnalyticsResponse: DhisEventAnalytics;
}>;

const defaultAnalytics: DhisAnalytics = {
  headers: [],
  metaData: { items: {}, dimensions: {} },
  rows: [],
};

export const stubDhisApi = ({
  getAnalyticsResponse = defaultAnalytics,
  getEventsResponse = [],
  getEventAnalyticsResponse = defaultAnalytics,
}: DhisApiStubResponses = {}) => {
  const dhisApi: DhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi', {
    getAnalytics: jest.fn().mockResolvedValue(getAnalyticsResponse),
    getEvents: jest.fn().mockResolvedValue(getEventsResponse),
    getEventAnalytics: jest.fn().mockResolvedValue(getEventAnalyticsResponse),
    fetchDataElements: jest
      .fn()
      .mockImplementation(async (codes: (keyof typeof DATA_ELEMENT_METADATA)[]) =>
        codes.map(code => ({ code, id: DATA_ELEMENT_METADATA[code].uid, valueType: 'NUMBER' }), {}),
      ),
    getServerName: jest.fn().mockReturnValue(SERVER_NAME),
    getResourceTypes: jest.fn().mockReturnValue({ DATA_ELEMENT: 'dataElement' }),
  });
  jest.spyOn(GetDhisApiInstance, 'getDhisApiInstance').mockReturnValue(dhisApi);

  return dhisApi;
};

export const createModelsStub = () =>
  (({
    dataElement: {
      find: async (dbConditions: { code: string[] }) =>
        Object.values(DATA_ELEMENTS).filter(({ code }) => dbConditions.code.includes(code)),
      getDhisDataTypes: () => ({ DATA_ELEMENT: 'DataElement', INDICATOR: 'Indicator' }),
    },
    dataGroup: {
      find: async (dbConditions: { code: string[] }) =>
        Object.values(DATA_GROUPS).filter(({ code }) => dbConditions.code.includes(code)),
      getDataElementsInDataGroup: async (groupCode: string) =>
        DATA_ELEMENTS_BY_GROUP[groupCode as keyof typeof DATA_ELEMENTS_BY_GROUP],
    },
  } as unknown) as DataBrokerModelRegistry);

/**
 * Reverse engineers the DHIS2 aggregate data response given the expected analytics
 */
export const buildDhisAnalyticsResponse = (analytics: Analytic[]): DhisAnalytics => {
  const rows = analytics.map(({ dataElement, organisationUnit, period, value }) => [
    dataElement,
    organisationUnit,
    period,
    value.toString(),
  ]);
  const dataElementsInAnalytics = analytics.map(
    ({ dataElement }) => dataElement as keyof typeof DATA_ELEMENTS,
  );
  const items = dataElementsInAnalytics
    .map(dataElement => {
      const { dataElementCode: dhisCode } = DATA_ELEMENTS[dataElement];
      return DATA_ELEMENT_METADATA[dhisCode as keyof typeof DATA_ELEMENT_METADATA];
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
