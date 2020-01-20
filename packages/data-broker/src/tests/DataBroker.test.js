/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DataBroker } from '../DataBroker';
import { stubs } from './helpers';

const DATA_SOURCES = {
  POP01: { code: 'POP01', service_type: 'testServiceType' },
};

const dataBroker = new DataBroker();

describe('DataBroker', () => {
  let getServiceFromDataSourceStub;
  let serviceStub;

  before(() => {
    stubs.getModels.stub({ dataSources: DATA_SOURCES });
  });

  beforeEach(() => {
    serviceStub = stubs.service.getStub();
    getServiceFromDataSourceStub = stubs.getServiceFromDataSource.stub(serviceStub);
  });

  afterEach(() => {
    stubs.getServiceFromDataSource.restore();
  });

  after(() => {
    stubs.getModels.restore();
  });

  it('push()', async () => {
    const dataSource = DATA_SOURCES.POP01;
    const metadata = { value: 2 };

    await dataBroker.push(dataSource.code, metadata);
    expect(getServiceFromDataSourceStub).to.have.been.calledOnceWithExactly(dataSource, metadata);
    expect(serviceStub.push).to.have.been.calledOnceWithExactly();
  });

  it('pull()', async () => {
    const dataSource = DATA_SOURCES.POP01;
    const metadata = { value: 2 };

    await dataBroker.pull(dataSource.code, metadata);
    expect(getServiceFromDataSourceStub).to.have.been.calledOnceWithExactly(dataSource, metadata);
    expect(serviceStub.pull).to.have.been.calledOnceWithExactly();
  });
});
