/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { Aggregator } from '@tupaia/aggregator';
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

const fetchAnalytics = sinon.stub();
fetchAnalytics
  .returns({ results: [] })
  .withArgs(sinon.match.any, sinon.match({ dataServices }), query, {
    aggregations: undefined,
    aggregationConfig,
    aggregationType,
    filter,
  })
  .callsFake((dataElementCodes, { programCodes }) => {
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

const aggregator = sinon.createStubInstance(Aggregator, { fetchAnalytics });
const dhisApi = {};

describe('SumBuilder', () => {
  const assertBuilderResponseIsCorrect = async (sumConfig, expectedResponse) => {
    const config = { ...sumConfig, dataServices };
    const builder = new SumBuilder(
      models,
      aggregator,
      dhisApi,
      config,
      query,
      entity,
      aggregationType,
    );
    return expect(builder.build()).to.eventually.deep.equal(expectedResponse);
  };

  it('should return zero sum for empty results', () =>
    assertBuilderResponseIsCorrect(
      { dataElementCodes: ['NON_EXISTING_CODE'] },
      { data: [{ name: 'sum', value: 0 }] },
    ));

  it('should sum all the values for aggregate data elements', () =>
    assertBuilderResponseIsCorrect(
      { dataElementCodes: ['AGGR01', 'AGGR02'] },
      { data: [{ name: 'sum', value: 4 }] },
    ));

  it('should sum all the values for event data elements', () =>
    assertBuilderResponseIsCorrect(
      { dataElementCodes: ['EVENT01', 'EVENT02'], programCode: PROGRAM_CODE },
      { data: [{ name: 'sum', value: 13 }] },
    ));
});
