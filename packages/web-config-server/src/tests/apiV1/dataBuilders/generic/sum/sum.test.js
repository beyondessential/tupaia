/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { DhisApi } from '/dhis/DhisApi';
import { SumBuilder } from '/apiV1/dataBuilders/generic/sum/sum';

const createGetAnalyticsStub = ({ args = [], results = [] }) => {
  const getAnalytics = sinon.stub();
  getAnalytics
    .returns({ results: [] })
    .withArgs(...args)
    .returns({ results });

  return getAnalytics;
};

const createDhisApiStub = ({ aggregateAnalytics = {}, eventAnalytics = {} }) =>
  sinon.createStubInstance(DhisApi, {
    getAnalytics: createGetAnalyticsStub(aggregateAnalytics),
    getEventAnalytics: createGetAnalyticsStub(eventAnalytics),
  });

describe('SumBuilder', () => {
  const aggregationType = 'FINAL_EACH_MONTH';
  const entity = {};
  const query = {};
  const codes = ['POP01', 'POP02'];

  const assertBuilderResponseIsCorrect = async (dhisApiStub, config, expectedResponse) => {
    const builder = new SumBuilder(dhisApiStub, config, query, entity, aggregationType);

    return expect(builder.build()).to.eventually.deep.equal(expectedResponse);
  };

  it('should throw an error if a dataSource is not provided', async () => {
    const dhisApiStub = {};
    const assertCorrectErrorIsThrown = async builder =>
      expect(builder.build()).to.eventually.be.rejectedWith('data source must');

    await assertCorrectErrorIsThrown(new SumBuilder(dhisApiStub));
    return assertCorrectErrorIsThrown(new SumBuilder(dhisApiStub, {}));
  });

  it('should throw an error if a non supported data source type is provided', async () => {
    const dhisApiStub = {};
    const assertCorrectErrorIsThrown = async builder =>
      expect(builder.build()).to.eventually.be.rejectedWith('source type');

    await assertCorrectErrorIsThrown(new SumBuilder(dhisApiStub, { dataSource: { codes } }));
    return assertCorrectErrorIsThrown(
      new SumBuilder(dhisApiStub, { dataSource: { codes, type: 'groupSet' } }),
    );
  });

  it('should return zero sum for empty results', () => {
    const aggregateAnalytics = {
      args: [{ dataElementCodes: codes }, query, aggregationType],
      results: [{ value: 10 }],
    };
    const dhisApiStub = createDhisApiStub({ aggregateAnalytics });
    const config = { dataSource: { type: 'single', codes: ['NON_EXISTING_CODE'] } };
    const expectedResponse = { data: [{ name: 'sum', value: 0 }] };

    return assertBuilderResponseIsCorrect(dhisApiStub, config, expectedResponse);
  });

  it('should sum all the values for aggregate data elements', () => {
    const aggregateAnalytics = {
      args: [{ dataElementCodes: codes }, query, aggregationType],
      results: [{ value: 1 }, { value: 3 }],
    };
    const dhisApiStub = createDhisApiStub({ aggregateAnalytics });
    const config = { dataSource: { type: 'single', codes } };
    const expectedResponse = { data: [{ name: 'sum', value: 4 }] };

    return assertBuilderResponseIsCorrect(dhisApiStub, config, expectedResponse);
  });

  it('should sum all the values for aggregate data element groups', () => {
    const aggregateAnalytics = {
      args: [{ dataElementGroupCodes: codes }, query, aggregationType],
      results: [{ value: 2 }, { value: 4 }],
    };
    const dhisApiStub = createDhisApiStub({ aggregateAnalytics });
    const config = { dataSource: { type: 'group', codes } };
    const expectedResponse = { data: [{ name: 'sum', value: 6 }] };

    return assertBuilderResponseIsCorrect(dhisApiStub, config, expectedResponse);
  });

  it('should sum all the values for event data elements', () => {
    const programCode = 'CD8';
    const eventAnalytics = {
      args: [
        { programCode, programCodes: undefined, dataElementCodes: codes },
        query,
        aggregationType,
      ],
      results: [{ value: 5 }, { value: 8 }],
    };
    const dhisApiStub = createDhisApiStub({ eventAnalytics });
    const config = { dataSource: { type: 'single', codes, programCode }, programCode };
    const expectedResponse = { data: [{ name: 'sum', value: 13 }] };

    return assertBuilderResponseIsCorrect(dhisApiStub, config, expectedResponse);
  });
});
