/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { simpleTableOfEvents } from '/apiV1/dataBuilders/generic/table/simpleTableOfEvents';

const dataServices = [{ isDataRegional: true }];
const dataBuilderConfig = {
  dataElementCodes: ['WHOSPAR'],
  programCode: 'WSRS',
  dataServices,
};
const query = { organisationUnitCode: 'World' };
const entity = {};

const analytics = {
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

const responseData = [
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
];

const fetchAnalytics = sinon.stub();
fetchAnalytics
  .withArgs(
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
  .returns(analytics);

const aggregator = {
  fetchAnalytics,
  aggregationTypes: { FINAL_EACH_YEAR: 'FINAL_EACH_YEAR' },
};
const dhisApi = {};

describe('simpleTableOfEvents', async () => {
  it('should return expected data', () =>
    expect(
      simpleTableOfEvents({ dataBuilderConfig, query, entity }, aggregator, dhisApi),
    ).to.eventually.deep.equal({ data: responseData }));
});
