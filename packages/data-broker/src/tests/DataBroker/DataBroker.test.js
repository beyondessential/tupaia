/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DataBroker } from '../../DataBroker';
import { DATA_SOURCE_SPECS, DATA_SOURCES } from './fixtures';
import { stubs } from './helpers';

const dataSources = Object.values(DATA_SOURCES);

const options = { ignoreErrors: true, organisationUnitCode: 'TO' };

describe('DataBroker', () => {
  let createServiceStub;
  let serviceStub;
  let modelsStub;

  const assertCreateServiceWasInvokedCorrectly = () => {
    expect(createServiceStub).to.have.been.calledOnceWithExactly(modelsStub, 'testServiceType');
  };

  before(() => {
    modelsStub = stubs.models.getStub({ dataSources });
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

  it('getDataSourceTypes()', () => {
    expect(new DataBroker().getDataSourceTypes()).to.deep.equal(modelsStub.dataSource.getTypes());
  });

  it('push()', async () => {
    const data = { value: 2 };

    await new DataBroker().push(DATA_SOURCE_SPECS.POP01, data);
    assertCreateServiceWasInvokedCorrectly();
    expect(serviceStub.push).to.have.been.calledOnceWithExactly(DATA_SOURCES.POP01, data);
  });

  it('delete()', async () => {
    const data = { value: 2 };

    await new DataBroker().delete(DATA_SOURCE_SPECS.POP01, data, options);
    assertCreateServiceWasInvokedCorrectly();
    expect(serviceStub.delete).to.have.been.calledOnceWithExactly(
      DATA_SOURCES.POP01,
      data,
      options,
    );
  });

  describe('pull()', () => {
    it('should throw an error if no code is provided', async () =>
      Promise.all(
        [{}, { type: 'dataElement' }, { code: '' }, { code: [] }].map(dataSourceSpec =>
          expect(new DataBroker().pull(dataSourceSpec, options)).to.eventually.be.rejectedWith(
            /Please provide.*data source/,
          ),
        ),
      ));

    it('single code', async () => {
      await new DataBroker().pull(DATA_SOURCE_SPECS.POP01, options);

      assertCreateServiceWasInvokedCorrectly();
      expect(serviceStub.pull).to.have.been.calledOnceWithExactly(
        [DATA_SOURCES.POP01],
        'dataElement',
        options,
      );
    });

    it('multiple codes', async () => {
      await new DataBroker().pull({ code: ['POP01', 'POP02'], type: 'dataElement' }, options);

      assertCreateServiceWasInvokedCorrectly();
      expect(serviceStub.pull).to.have.been.calledOnceWithExactly(
        dataSources,
        'dataElement',
        options,
      );
    });
  });
});
