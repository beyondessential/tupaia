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

const fetchOptions = { period: '20200214' };
const aggregationOptions = {
  aggregationType: 'MOST_RECENT',
  aggregationConfig: { orgUnitToGroupKeys: [] },
  measureCriteria: { EQ: 3 },
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
    const assertDataBrokerPullIsInvokedCorrectly = ({ codeInput }) => {
      expect(dataBroker.pull).to.have.been.calledOnceWithExactly(
        { code: codeInput, type: DATA_ELEMENT },
        fetchOptions,
      );
      dataBroker.pull.resetHistory();
    };

    it('`aggregationOptions` parameter is optional', async () => {
      const assertErrorIsNotThrown = async emptyAggregationOptions =>
        expect(aggregator.fetchAnalytics('POP01', fetchOptions, emptyAggregationOptions)).to
          .eventually.not.be.rejected;

      return Promise.all([undefined, null, {}].map(assertErrorIsNotThrown));
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

    it('fetches, then aggregates, then filters analytics', async () => {
      const { aggregationType, aggregationConfig, measureCriteria } = aggregationOptions;
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
        measureCriteria,
      );
    });

    it('returns a response with processed results, metadata and the provided period', async () => {
      const { metadata } = RESPONSE_BY_SOURCE_TYPE[DATA_ELEMENT];
      const period = '20160214';

      expect(
        aggregator.fetchAnalytics(['POP01', 'POP02'], { period }, aggregationOptions),
      ).to.eventually.deep.equal({
        results: FILTERED_ANALYTICS,
        metadata,
        period,
      });
    });
  });

  it('fetchEvents()', async () => {
    const code = 'PROGRAM_1';

    const response = await aggregator.fetchEvents(code, fetchOptions);
    expect(dataBroker.pull).to.have.been.calledOnceWithExactly(
      { code, type: DATA_GROUP },
      fetchOptions,
    );
    expect(response).to.deep.equal(RESPONSE_BY_SOURCE_TYPE[DATA_GROUP]);
  });
});
