/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import pickBy from 'lodash.pickby';
import sinon from 'sinon';

import { Aggregator } from '/aggregator';
import { DATA_ELEMENTS, ORG_UNITS } from './tableOfDataValues.fixtures';

const query = { organisationUnitCode: 'TO' };
const dataServices = [{ isDataRegional: false }];
const period = {
  requested: '202001;202002;202003;202004',
  earliestAvailable: '20200105',
  latestAvailable: '20200406',
};

const createAggregatorStub = dataValues => {
  const fetchAnalytics = sinon.stub();
  fetchAnalytics
    .returns({ results: [] })
    .withArgs(sinon.match.any, sinon.match({ dataServices }), sinon.match(query))
    .callsFake(dataElementCodes => ({
      results: Object.values(dataValues).filter(({ dataElement }) =>
        dataElementCodes.includes(dataElement),
      ),
      period,
    }));

  const fetchDataElements = sinon.stub();
  fetchDataElements
    .returns({ dataElements: [] })
    .withArgs(
      sinon.match.any,
      sinon.match({
        organisationUnitCode: query.organisationUnitCode,
        dataServices,
        includeOptions: true,
      }),
    )
    .callsFake(codes => pickBy(DATA_ELEMENTS, ({ code }) => codes.includes(code)));

  return sinon.createStubInstance(Aggregator, { fetchAnalytics, fetchDataElements });
};

const models = {
  entity: {
    find: sinon
      .stub()
      .callsFake(({ code: codes }) => ORG_UNITS.filter(({ code }) => codes.includes(code))),
  },
};

export const createAssertTableResults = (table, availableDataValues) => {
  const aggregator = createAggregatorStub(availableDataValues);
  const dhisApi = {};

  return async (tableConfig, expectedResults) => {
    const dataBuilderConfig = { ...tableConfig, dataServices };
    return expect(
      table({ models, dataBuilderConfig, query }, aggregator, dhisApi),
    ).to.eventually.deep.equal({ period, ...expectedResults });
  };
};

export const createAssertErrorIsThrown = (table, availableDataValues) => {
  const aggregator = createAggregatorStub(availableDataValues);
  const dhisApi = {};

  return async (tableConfig, expectedError) => {
    const dataBuilderConfig = { ...tableConfig, dataServices };
    return expect(
      table({ models, dataBuilderConfig, query }, aggregator, dhisApi),
    ).to.be.rejectedWith(expectedError);
  };
};
