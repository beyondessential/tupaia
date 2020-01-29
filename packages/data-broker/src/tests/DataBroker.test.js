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
  let createServiceStub;
  let serviceStub;
  let modelsStub;

  const assertCreateServiceWasInvokedCorrectly = () => {
    expect(createServiceStub).to.have.been.calledOnceWithExactly(
      modelsStub,
      dataSource.service_type,
    );
  };

  before(() => {
    modelsStub = stubs.models.getStub({ dataSources: [dataSource] });
    stubs.getModels.stub(modelsStub);
  });

  beforeEach(() => {
    serviceStub = stubs.service.getStub();
    createServiceStub = stubs.createService.stub(serviceStub);
  });

  afterEach(() => {
    stubs.createService.restore();
  });

  after(() => {
    stubs.getModels.restore();
  });

  it('push()', async () => {
    const data = { value: 2 };

    await new DataBroker().push(dataSourceSpec, data);
    assertCreateServiceWasInvokedCorrectly();
    expect(serviceStub.push).to.have.been.calledOnceWithExactly(dataSource, data);
  });

  it('delete()', async () => {
    const data = { value: 2 };
    const options = { ignoreErrors: true };

    await new DataBroker().delete(dataSourceSpec, data, options);
    assertCreateServiceWasInvokedCorrectly();
    expect(serviceStub.delete).to.have.been.calledOnceWithExactly(dataSource, data, options);
  });

  it('pull()', async () => {
    const metadata = { orgUnit: 'TO' };

    await new DataBroker().pull(dataSourceSpec, metadata);
    assertCreateServiceWasInvokedCorrectly();
    expect(serviceStub.pull).to.have.been.calledOnceWithExactly(dataSource, metadata);
  });
});
