/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { DataBroker } from '@tupaia/data-broker';
import { Aggregator } from '../../Aggregator';
import * as AggregateAnalytics from '../../analytics/aggregateAnalytics/aggregateAnalytics';
import * as FilterAnalytics from '../../analytics/filterAnalytics';

import {
  DATA_SOURCE_TYPES,
  RESPONSE_BY_SOURCE_TYPE,
  AGGREGATED_ANALYTICS,
  FILTERED_ANALYTICS,
} from './fixtures';
import { AGGREGATION_TYPES } from '../../aggregationTypes';

const { DATA_ELEMENT, DATA_GROUP } = DATA_SOURCE_TYPES;

const dataBroker = sinon.createStubInstance(DataBroker, {
  getDataSourceTypes: DATA_SOURCE_TYPES,
  pull: sinon.stub().callsFake(({ type }) => RESPONSE_BY_SOURCE_TYPE[type]),
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
      config: { orgUnitToGroupKeys: [], requestedPeriod: '20200214;20200215' },
    },
  ],
  filter: { value: 3 },
};

describe('Aggregator', () => {
  before(() => {
    sinon.stub(AggregateAnalytics, 'aggregateAnalytics').returns(AGGREGATED_ANALYTICS);
    sinon.stub(FilterAnalytics, 'filterAnalytics').returns(FILTERED_ANALYTICS);
  });

  beforeEach(() => {
    aggregator = new Aggregator(dataBroker);
    dataBroker.pull.resetHistory();
    AggregateAnalytics.aggregateAnalytics.resetHistory();
    FilterAnalytics.filterAnalytics.resetHistory();
  });

  after(() => {
    AggregateAnalytics.aggregateAnalytics.restore();
    FilterAnalytics.filterAnalytics.restore();
  });

  it('aggregationTypes getter', () => {
    expect(aggregator.aggregationTypes).to.deep.equal(AGGREGATION_TYPES);
  });

  describe('fetchAnalytics()', () => {
    const assertDataBrokerPullIsInvokedCorrectly = ({ codeInput }, additionalOptions) => {
      expect(dataBroker.pull).to.have.been.calledOnceWithExactly(
        { code: codeInput, type: DATA_ELEMENT },
        { ...fetchOptions, ...additionalOptions },
      );
      dataBroker.pull.resetHistory();
    };

    const assertDataBrokerPullIsNotInvoked = () => {
      expect(dataBroker.pull).to.have.been.callCount(0);
      dataBroker.pull.resetHistory();
    };

    it('`aggregationOptions` parameter is optional', async () => {
      const assertErrorIsNotThrown = async emptyAggregationOptions =>
        expect(aggregator.fetchAnalytics('POP01', fetchOptions, emptyAggregationOptions)).to.not.be
          .rejected;

      return Promise.all([undefined, {}].map(assertErrorIsNotThrown));
    });

    it('supports string code input', async () => {
      const code = 'POP01';

      await aggregator.fetchAnalytics(code, fetchOptions);
      assertDataBrokerPullIsInvokedCorrectly({ codeInput: [code] });
    });

    it('supports array code input ', async () => {
      const codes = ['POP01', 'POP02'];

      await aggregator.fetchAnalytics(codes, fetchOptions);
      assertDataBrokerPullIsInvokedCorrectly({ codeInput: codes });
    });

    it('returns data for just organisationUnitCode', async () => {
      const codes = ['POP01', 'POP02'];

      await aggregator.fetchAnalytics(codes, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
        organisationUnitCode: 'TO',
      });
      assertDataBrokerPullIsInvokedCorrectly(
        {
          codeInput: codes,
        },
        { organisationUnitCodes: undefined, organisationUnitCode: 'TO' },
      );
    });

    it('immediately returns empty data for no organisationUnitCode or organisationUnitCode', async () => {
      const codes = ['POP01', 'POP02'];

      const result = await aggregator.fetchAnalytics(codes, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
      });
      assertDataBrokerPullIsNotInvoked();
      return expect(result).to.deep.equal({
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
      expect(dataBroker.pull).to.have.been.calledBefore(AggregateAnalytics.aggregateAnalytics);
      expect(AggregateAnalytics.aggregateAnalytics).to.have.been.calledOnceWithExactly(
        results,
        aggregationType,
        aggregationConfig,
      );
      expect(AggregateAnalytics.aggregateAnalytics).to.have.been.calledBefore(
        FilterAnalytics.filterAnalytics,
      );
      expect(FilterAnalytics.filterAnalytics).to.have.been.calledOnceWithExactly(
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
      ).to.eventually.deep.equal({
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
      expect(dataBroker.pull).to.have.been.calledOnceWithExactly(
        { code, type: DATA_GROUP },
        fetchOptions,
      );
      expect(response).to.deep.equal(RESPONSE_BY_SOURCE_TYPE[DATA_GROUP]);
    });

    it('returns data for just organisationUnitCode', async () => {
      const code = 'PROGRAM_1';

      await aggregator.fetchEvents(code, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
        organisationUnitCode: 'TO',
      });
      expect(dataBroker.pull).to.have.been.calledOnceWithExactly(
        { code, type: DATA_GROUP },
        { ...fetchOptions, organisationUnitCodes: undefined, organisationUnitCode: 'TO' },
      );
    });

    it('immediately returns empty data for no organisationUnitCode or organisationUnitCode', async () => {
      const code = 'PROGRAM_1';

      const response = await aggregator.fetchEvents(code, {
        ...fetchOptions,
        organisationUnitCodes: undefined,
      });
      expect(dataBroker.pull).to.have.been.callCount(0);
      return expect(response).to.deep.equal([]);
    });
  });
});
