/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import * as FetchComposedData from '/apiV1/dataBuilders/helpers/fetchComposedData';
import { composeSinglePercentage } from '/apiV1/dataBuilders/generic/compose';

const aggregator = {};
const dhisApi = {};


const stubFetchComposedData = expectedResults => {
  const fetchComposedDataStub = sinon.stub(FetchComposedData, 'fetchComposedData');
  fetchComposedDataStub.returns(expectedResults);
};

describe('composeSinglePercentage', () => {
  afterEach(() => {
    FetchComposedData.fetchComposedData.restore();
  });

  it('should return no data if it receives no data', async () => {
    const testConfig = {
      dataBuilderConfig: {},
    };
    const data1 = [{ name: 'Should not matter', value: 'No Data' }];
    const data2 = [{ name: 'Also irrelevent', value: 4 }];
    stubFetchComposedData({
      count: { data: data1 },
      percentage: { data: data2 },
    });

    return expect(
      composeSinglePercentage(testConfig, aggregator, dhisApi),
    ).to.eventually.have.deep.property('data', []);
  });

  it('should compose period data from multiple data builders', async () => {
    const testConfig = {
      dataBuilderConfig: {},
    };
    const data1 = [{ name: 'Should not matter', value: 2 }];
    const data2 = [{ name: 'Also irrelevent', value: 4 }];
    stubFetchComposedData({
      numerator: { data: data1 },
      denominator: { data: data2 },
    });

    return expect(
      composeSinglePercentage(testConfig, aggregator, dhisApi),
    ).to.eventually.have.deep.property('data', [
      { name: 'percentage', value: 0.5, value_metadata: { numerator: 2, denominator: 4 } },
    ]);
  });
});
