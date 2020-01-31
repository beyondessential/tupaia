/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { tableOfDataValues } from '/apiV1/dataBuilders';
import { DhisApi } from '/dhis/DhisApi';

const query = { organisationUnitCode: 'TO' };

const createDhisApiStub = dataValues => {
  const getAnalytics = sinon.stub();
  getAnalytics
    .returns({ results: [] })
    .withArgs(sinon.match({ outputIdScheme: 'code' }), query)
    .callsFake(({ dataElementCodes }) => ({
      results: Object.values(dataValues).filter(({ dataElement }) =>
        dataElementCodes.includes(dataElement),
      ),
    }));

  return sinon.createStubInstance(DhisApi, { getAnalytics });
};

export const createAssertTableResults = availableDataValues => {
  const aggregatorStub = {};
  const dhisApiStub = createDhisApiStub(availableDataValues);

  return async (dataBuilderConfig, expectedResults) =>
    expect(
      tableOfDataValues({ dataBuilderConfig, query }, aggregatorStub, dhisApiStub),
    ).to.eventually.deep.equal(expectedResults);
};

export const createAssertErrorIsThrown = availableDataValues => {
  const aggregatorStub = {};
  const dhisApiStub = createDhisApiStub(availableDataValues);

  return async (dataBuilderConfig, expectedError) =>
    expect(
      tableOfDataValues({ dataBuilderConfig, query }, aggregatorStub, dhisApiStub),
    ).to.eventually.be.rejectedWith(expectedError);
};
