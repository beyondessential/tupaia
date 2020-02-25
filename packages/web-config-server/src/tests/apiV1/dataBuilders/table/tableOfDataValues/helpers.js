/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import pickBy from 'lodash.pickby';
import sinon from 'sinon';

import { Aggregator } from '/aggregator';
import { tableOfDataValues } from '/apiV1/dataBuilders';
import { DATA_ELEMENTS } from './tableOfDataValues.fixtures';

const query = { organisationUnitCode: 'TO' };
const dataServices = [{ isDataRegional: false }];

const createAggregatorStub = dataValues => {
  const fetchAnalytics = sinon.stub();
  fetchAnalytics
    .returns({ results: [] })
    .withArgs(sinon.match.any, sinon.match({ dataServices }), sinon.match(query))
    .callsFake(dataElementCodes => ({
      results: Object.values(dataValues).filter(({ dataElement }) =>
        dataElementCodes.includes(dataElement),
      ),
    }));

  const fetchDataElements = sinon.stub();
  fetchDataElements
    .returns({ dataElements: [] })
    .withArgs(
      sinon.match.any,
      sinon.match({
        organisationUnitCode: query.organisationUnitCode,
        dataServices,
        shouldIncludeOptions: true,
      }),
    )
    .callsFake(codes => pickBy(DATA_ELEMENTS, ({ code }) => codes.includes(code)));

  return sinon.createStubInstance(Aggregator, { fetchAnalytics, fetchDataElements });
};

export const createAssertTableResults = availableDataValues => {
  const aggregator = createAggregatorStub(availableDataValues);
  const dhisApi = {};

  return async (tableConfig, expectedResults) => {
    const dataBuilderConfig = { ...tableConfig, dataServices };
    return expect(
      tableOfDataValues({ dataBuilderConfig, query }, aggregator, dhisApi),
    ).to.eventually.deep.equal(expectedResults);
  };
};

export const createAssertErrorIsThrown = availableDataValues => {
  const aggregator = createAggregatorStub(availableDataValues);
  const dhisApi = {};

  return async (tableConfig, expectedError) => {
    const dataBuilderConfig = { ...tableConfig, dataServices };
    return expect(
      tableOfDataValues({ dataBuilderConfig, query }, aggregator, dhisApi),
    ).to.eventually.be.rejectedWith(expectedError);
  };
};
