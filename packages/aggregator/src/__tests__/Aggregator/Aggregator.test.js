/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createJestMockInstance } from '@tupaia/utils';
import { Aggregator } from '../../Aggregator';
import * as AggregateAnalytics from '../../analytics/aggregateAnalytics/aggregateAnalytics';
import * as FilterAnalytics from '../../analytics/filterAnalytics';
import { AGGREGATION_TYPES } from '../../aggregationTypes';
import {
  DATA_SOURCE_TYPES,
  RESPONSE_BY_SOURCE_TYPE,
  AGGREGATED_ANALYTICS,
  FILTERED_ANALYTICS,
} from './fixtures';

jest.mock('../../analytics/aggregateAnalytics/aggregateAnalytics');
AggregateAnalytics.aggregateAnalytics.mockReturnValue(AGGREGATED_ANALYTICS);
jest.mock('../../analytics/filterAnalytics');
FilterAnalytics.filterAnalytics.mockReturnValue(FILTERED_ANALYTICS);

const { DATA_ELEMENT, DATA_GROUP } = DATA_SOURCE_TYPES;

const dataBroker = createJestMockInstance('@tupaia/data-broker', 'DataBroker', {
  context: {},
  getDataSourceTypes: () => DATA_SOURCE_TYPES,
  pullAnalytics: async () => RESPONSE_BY_SOURCE_TYPE[DATA_ELEMENT],
  pullEvents: async () => RESPONSE_BY_SOURCE_TYPE[DATA_GROUP],
});

let aggregator;

const fetchOptions = {
  organisationUnitCodes: ['TO'],
  startDate: '20200214',
  endDate: '20200215',
  period: '20200214;20200215',
};
const aggregationOptions = {
  aggregations: [
    {
      type: 'MOST_RECENT',
      config: { orgUnitMap: {}, requestedPeriod: '20200214;20200215' },
    },
  ],
  filter: { value: 3 },
};

describe('Aggregator', () => {
  beforeEach(() => {
    aggregator = new Aggregator(dataBroker);
  });

  it('aggregationTypes getter', () => {
    expect(aggregator.aggregationTypes).toStrictEqual(AGGREGATION_TYPES);
  });

  describe('fetchAnalytics()', () => {
    it('`aggregationOptions` parameter is optional', async () => {
      const assertErrorIsNotThrown = async emptyAggregationOptions =>
        expect(
          aggregator.fetchAnalytics('POP01', fetchOptions, emptyAggregationOptions),
        ).toResolve();

      return Promise.all([undefined, {}].map(assertErrorIsNotThrown));
    });

    it('supports string code input', async () => {
      const code = 'POP01';

      await aggregator.fetchAnalytics(code, fetchOptions);
      expect(dataBroker.pullAnalytics).toHaveBeenCalledOnceWith([code], fetchOptions);
    });

    it('supports array code input ', async () => {
      const codes = ['POP01', 'POP02'];

      await aggregator.fetchAnalytics(codes, fetchOptions);
      expect(dataBroker.pullAnalytics).toHaveBeenCalledOnceWith(codes, fetchOptions);
    });

    it('passes aggregations through to data source', async () => {
      const codes = ['POP01', 'POP02'];

      await aggregator.fetchAnalytics(codes, fetchOptions, aggregationOptions);
      expect(dataBroker.pullAnalytics).toHaveBeenCalledOnceWith(codes, {
        ...fetchOptions,
        aggregations: aggregationOptions.aggregations,
      });
    });

    it('returns data for just organisationUnitCode', async () => {
      const codes = ['POP01', 'POP02'];

      await aggregator.fetchAnalytics(codes, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
        organisationUnitCode: 'TO',
      });
      expect(dataBroker.pullAnalytics).toHaveBeenCalledOnceWith(codes, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
        organisationUnitCode: 'TO',
      });
    });

    it('immediately returns empty data for no organisationUnitCode or organisationUnitCode', async () => {
      const codes = ['POP01', 'POP02'];

      const result = await aggregator.fetchAnalytics(codes, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
      });
      expect(dataBroker.pullAnalytics).toHaveBeenCalledTimes(0);
      return expect(result).toStrictEqual({
        results: [],
        metadata: {
          dataElementCodeToName: {},
        },
        period: {
          earliestAvailable: null,
          latestAvailable: null,
          requested: '20200214;20200215',
        },
      });
    });

    it('fetches, then aggregates, then filters analytics', async () => {
      const { aggregations, filter } = aggregationOptions;
      const { type: aggregationType, config: aggregationConfig } = aggregations[0];
      const { results } = RESPONSE_BY_SOURCE_TYPE[DATA_ELEMENT];

      await aggregator.fetchAnalytics(['POP01', 'POP02'], fetchOptions, aggregationOptions);
      expect(dataBroker.pullAnalytics).toHaveBeenCalledBefore(
        AggregateAnalytics.aggregateAnalytics,
      );
      expect(AggregateAnalytics.aggregateAnalytics).toHaveBeenCalledOnceWith(
        results[0].analytics,
        aggregationType,
        aggregationConfig,
      );
      expect(AggregateAnalytics.aggregateAnalytics).toHaveBeenCalledBefore(
        FilterAnalytics.filterAnalytics,
      );
      expect(FilterAnalytics.filterAnalytics).toHaveBeenCalledOnceWith(
        AGGREGATED_ANALYTICS,
        filter,
      );
    });

    it('returns a response with processed results, metadata and period data', async () => {
      const { metadata } = RESPONSE_BY_SOURCE_TYPE[DATA_ELEMENT];
      const period = '20160214';

      return expect(
        aggregator.fetchAnalytics(
          ['POP01', 'POP02'],
          { ...fetchOptions, period },
          aggregationOptions,
        ),
      ).resolves.toStrictEqual({
        results: FILTERED_ANALYTICS,
        metadata,
        period: {
          earliestAvailable: '20200214',
          latestAvailable: '20200214',
          requested: '20160214',
        },
      });
    });
  });

  describe('fetch events', () => {
    it('fetches events', async () => {
      const code = 'PROGRAM_1';

      const response = await aggregator.fetchEvents(code, fetchOptions);
      expect(dataBroker.pullEvents).toHaveBeenCalledOnceWith([code], fetchOptions);
      expect(response).toStrictEqual(RESPONSE_BY_SOURCE_TYPE[DATA_GROUP]);
    });

    it('returns data for just organisationUnitCode', async () => {
      const code = 'PROGRAM_1';

      await aggregator.fetchEvents(code, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
        organisationUnitCode: 'TO',
      });
      expect(dataBroker.pullEvents).toHaveBeenCalledOnceWith([code], {
        ...fetchOptions,
        organisationUnitCodes: undefined,
        organisationUnitCode: 'TO',
      });
    });

    it('immediately returns empty data for no organisationUnitCode or organisationUnitCode', async () => {
      const code = 'PROGRAM_1';

      const response = await aggregator.fetchEvents(code, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
      });
      expect(dataBroker.pullEvents).toHaveBeenCalledTimes(0);
      return expect(response).toStrictEqual([]);
    });
  });
});
