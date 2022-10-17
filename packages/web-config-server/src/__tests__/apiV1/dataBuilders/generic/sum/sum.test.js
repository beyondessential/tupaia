/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

import { createJestMockInstance } from '@tupaia/utils';
import { SumBuilder } from '/apiV1/dataBuilders/generic/sum/sum';

const AGGREGATE_ANALYTICS = [
  { dataElement: 'AGGR01', value: 1 },
  { dataElement: 'AGGR02', value: 3 },
];
const EVENT_ANALYTICS = [
  { dataElement: 'EVENT01', value: 5 },
  { dataElement: 'EVENT02', value: 8 },
];
const PROGRAM_CODE = 'CD8';

const dataServices = [{ isDataRegional: false }];
const models = {};
const entity = {};
const query = { organisationUnitCode: 'TO' };
const aggregationType = 'FINAL_EACH_MONTH';
const aggregationConfig = {};
const filter = {};

const fetchAnalytics = jest.fn();
when(fetchAnalytics)
  .calledWith(expect.anything(), expect.objectContaining({ dataServices }), query, {
    aggregations: undefined,
    aggregationConfig,
    aggregationType,
    filter,
  })
  .mockImplementation((dataElementCodes, { programCodes }) => {
    const getAnalyticsToUse = () => {
      if (programCodes) {
        return programCodes.includes(PROGRAM_CODE) ? EVENT_ANALYTICS : [];
      }
      return AGGREGATE_ANALYTICS;
    };

    const analytics = getAnalyticsToUse();
    const results = analytics.filter(({ dataElement }) => dataElementCodes.includes(dataElement));
    return { results };
  });

const aggregator = createJestMockInstance('@tupaia/aggregator', 'Aggregator', { fetchAnalytics });
const dhisApi = createJestMockInstance('@tupaia/dhis-api', 'DhisApi');

describe('SumBuilder', () => {
  const getBuilder = ({ config }) =>
    new SumBuilder(models, aggregator, dhisApi, config, query, entity, aggregationType);

  it('should return zero sum for empty results', async () => {
    const config = { dataElementCodes: ['NON_EXISTING_CODE'], dataServices };
    const builder = getBuilder({ config });

    const response = await builder.build();
    expect(response).toStrictEqual({ data: [{ name: 'sum', value: 0 }] });
  });

  it('should sum all the values for aggregate data elements', async () => {
    const config = { dataElementCodes: ['AGGR01', 'AGGR02'], dataServices };
    const builder = getBuilder({ config });

    const response = await builder.build();
    expect(response).toStrictEqual({ data: [{ name: 'sum', value: 4 }] });
  });

  it('should sum all the values for event data elements', async () => {
    const config = {
      dataElementCodes: ['EVENT01', 'EVENT02'],
      programCode: PROGRAM_CODE,
      dataServices,
    };
    const builder = getBuilder({ config });

    const response = await builder.build();
    expect(response).toStrictEqual({ data: [{ name: 'sum', value: 13 }] });
  });
});
