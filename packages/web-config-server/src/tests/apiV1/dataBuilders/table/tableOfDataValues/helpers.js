/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { tableOfDataValues } from '/apiV1/dataBuilders';
import { DhisApi } from '/dhis/DhisApi';

const query = { organisationUnitCode: 'TO' };

const createGetAnalyticsStub = dataValues => {
  const stub = sinon.stub();
  stub
    .returns({ results: [] })
    .withArgs(sinon.match({ outputIdScheme: 'code' }), query)
    .callsFake(({ dataElementCodes }) => ({
      results: Object.values(dataValues).filter(({ dataElement }) =>
        dataElementCodes.includes(dataElement),
      ),
    }));

  return stub;
};

export const createAssertTableResults = availableDataValues => {
  const dhisApiStub = sinon.createStubInstance(DhisApi, {
    getAnalytics: createGetAnalyticsStub(availableDataValues),
  });

  return async (dataBuilderConfig, expectedResults) =>
    expect(tableOfDataValues({ dataBuilderConfig, query }, dhisApiStub)).to.eventually.deep.equal(
      expectedResults,
    );
};
