import { expect } from 'chai';
import sinon from 'sinon';

import { Aggregator } from '@tupaia/aggregator';
import { DhisApi } from '/dhis/DhisApi';
import { fetchComposedData } from '/apiV1/dataBuilders/helpers/fetchComposedData';
import * as GetDataBuilder from '/apiV1/dataBuilders/getDataBuilder';

const DATA_RESPONSES = {
  countBuilder: [{ value: 1 }],
  percentageBuilder: [{ value: 0.1 }],
};
const DATA_BUILDERS = {
  countBuilder: {
    stub: sinon.stub().returns(DATA_RESPONSES.countBuilder),
    config: { dataElementCode: 'STR_169' },
  },
  percentageBuilder: {
    stub: sinon.stub().returns(DATA_RESPONSES.percentageBuilder),
    config: { limitRange: [0, 1] },
  },
};
const query = {
  startPeriod: '201910',
  endPeriod: '201911',
};
const dataServices = [{ isDataRegional: true }];
const aggregator = sinon.createStubInstance(Aggregator);
const dhisApi = sinon.createStubInstance(DhisApi);

const callFetchComposedData = async () => {
  const dataBuilderConfig = {
    dataBuilders: {
      count: {
        dataBuilder: 'countBuilder',
        dataBuilderConfig: DATA_BUILDERS.countBuilder.config,
      },
      percentage: {
        dataBuilder: 'percentageBuilder',
        dataBuilderConfig: DATA_BUILDERS.percentageBuilder.config,
      },
    },
    dataServices,
  };

  return fetchComposedData({ dataBuilderConfig, query }, aggregator, dhisApi);
};

describe('fetchComposedData()', () => {
  before(() => {
    sinon
      .stub(GetDataBuilder, 'getDataBuilder')
      .callsFake(builderName => DATA_BUILDERS[builderName].stub);
  });

  after(() => {
    GetDataBuilder.getDataBuilder.restore();
  });

  it('should throw an error if no data builders are provided', () =>
    expect(fetchComposedData({ dataBuilderConfig: {} })).to.be.rejectedWith('Data builders'));

  it('should invoke the specified data builders with the expected arguments', async () => {
    await callFetchComposedData();

    expect(DATA_BUILDERS.countBuilder.stub).to.have.been.calledOnceWith(
      { dataBuilderConfig: { ...DATA_BUILDERS.countBuilder.config, dataServices }, query },
      aggregator,
      dhisApi,
    );
    expect(DATA_BUILDERS.percentageBuilder.stub).to.have.been.calledOnceWith(
      { dataBuilderConfig: { ...DATA_BUILDERS.percentageBuilder.config, dataServices }, query },
      aggregator,
      dhisApi,
    );
  });

  it('should return a map of builder keys to data responses per builder ', async () =>
    expect(callFetchComposedData()).to.eventually.deep.equal({
      count: DATA_RESPONSES.countBuilder,
      percentage: DATA_RESPONSES.percentageBuilder,
    }));
});
