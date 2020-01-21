/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DataBroker } from '../DataBroker';
import { stubs } from './helpers';

const dataSource = { code: 'POP01', service_type: 'testServiceType' };

describe('DataBroker', () => {
  let getServiceFromDataSourceStub;
  let serviceStub;
  let modelsStub;

  before(() => {
    modelsStub = stubs.models.getStub({ dataSources: [dataSource] });
    stubs.getModels.stub(modelsStub);
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
    const data = { value: 2 };

    await new DataBroker().push(dataSource.code, data);
    expect(getServiceFromDataSourceStub).to.have.been.calledOnceWithExactly(dataSource, modelsStub);
    expect(serviceStub.push).to.have.been.calledOnceWithExactly(data);
  });

  it('pull()', async () => {
    const metadata = { orgUnit: 'TO' };

    await new DataBroker().pull(dataSource.code, metadata);
    expect(getServiceFromDataSourceStub).to.have.been.calledOnceWithExactly(dataSource, modelsStub);
    expect(serviceStub.pull).to.have.been.calledOnceWithExactly(metadata);
  });
});
