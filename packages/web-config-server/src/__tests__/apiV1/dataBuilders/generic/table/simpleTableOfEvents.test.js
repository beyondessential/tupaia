/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

import { createJestMockInstance } from '@tupaia/utils';
import { simpleTableOfEvents } from '/apiV1/dataBuilders/generic/table/simpleTableOfEvents';

const dataServices = [{ isDataRegional: true }];
const dataBuilderConfig = {
  dataElementCodes: ['WHOSPAR'],
  programCode: 'WSRS',
  dataServices,
};
const query = { organisationUnitCode: 'World' };
const entity = {};

const ANALYTICS = {
  results: [
    {
      dataElement: 'WHOSPAR',
      organisationUnit: 'World',
      period: '20100208',
      value: 8,
    },
    {
      dataElement: 'WHOSPAR',
      organisationUnit: 'World',
      period: '20110208',
      value: 7,
    },
    {
      dataElement: 'WHOSPAR',
      organisationUnit: 'World',
      period: '20120208',
      value: 13,
    },
  ],
  metadata: {
    dataElementCodeToName: { WHOSPAR: 'WHOSPAR' },
  },
};

const fetchAnalytics = jest.fn();
when(fetchAnalytics)
  .calledWith(
    ['WHOSPAR'],
    {
      dataServices,
      entityAggregation: undefined,
      dataSourceEntityFilter: undefined,
      programCodes: ['WSRS'],
    },
    query,
    {
      aggregations: undefined,
      aggregationType: 'FINAL_EACH_YEAR',
      aggregationConfig: {},
      filter: {},
    },
  )
  .mockResolvedValue(ANALYTICS);

const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', {
  fetchAnalytics,
  aggregationTypes: { FINAL_EACH_YEAR: 'FINAL_EACH_YEAR' },
});
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

describe('simpleTableOfEvents', () => {
  it('should return expected data', async () => {
    const response = await simpleTableOfEvents(
      { dataBuilderConfig, query, entity },
      aggregator,
      dhisApi,
    );
    expect(response).toStrictEqual({
      data: [
        {
          dataElement: 'WHOSPAR',
          organisationUnit: 'World',
          period: '20100208',
          value: 8,
          name: '2010',
        },
        {
          dataElement: 'WHOSPAR',
          organisationUnit: 'World',
          period: '20110208',
          value: 7,
          name: '2011',
        },
        {
          dataElement: 'WHOSPAR',
          organisationUnit: 'World',
          period: '20120208',
          value: 13,
          name: '2012',
        },
      ],
    });
  });
});
