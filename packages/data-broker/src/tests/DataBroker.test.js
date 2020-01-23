/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DataBroker } from '../DataBroker';
import { stubs } from './helpers';

const dataSource = { code: 'POP01', type: 'dataElement', service_type: 'testServiceType' };
const dataSourceSpec = { code: dataSource.code, type: dataSource.type };

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

    await new DataBroker().push(dataSourceSpec, data);
    expect(getServiceFromDataSourceStub).to.have.been.calledOnceWithExactly(dataSource, modelsStub);
    expect(serviceStub.push).to.have.been.calledOnceWithExactly(data);
  });

  it('delete()', async () => {
    const data = { value: 2 };
    const options = { ignoreErrors: true };

    await new DataBroker().delete(dataSourceSpec, data, options);
    expect(getServiceFromDataSourceStub).to.have.been.calledOnceWithExactly(dataSource, modelsStub);
    expect(serviceStub.delete).to.have.been.calledOnceWithExactly(data, options);
  });

  it('pull()', async () => {
    const metadata = { orgUnit: 'TO' };

    await new DataBroker().pull(dataSourceSpec, metadata);
    expect(getServiceFromDataSourceStub).to.have.been.calledOnceWithExactly(dataSource, modelsStub);
    expect(serviceStub.pull).to.have.been.calledOnceWithExactly(metadata);
  });
});
