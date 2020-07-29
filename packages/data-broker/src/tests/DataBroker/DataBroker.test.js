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

  const assertCreateServiceWasInvokedCorrectly = dataBroker => {
    expect(createServiceStub).to.have.been.calledOnceWithExactly(
      modelsStub,
      'testServiceType',
      dataBroker,
    );
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
    const dataBroker = new DataBroker();
    await dataBroker.push(DATA_SOURCE_SPECS.POP01, data);
    assertCreateServiceWasInvokedCorrectly(dataBroker);
    expect(serviceStub.push).to.have.been.calledOnceWithExactly([DATA_SOURCES.POP01], data);
  });

  it('delete()', async () => {
    const data = { value: 2 };
    const dataBroker = new DataBroker();
    await dataBroker.delete(DATA_SOURCE_SPECS.POP01, data, options);
    assertCreateServiceWasInvokedCorrectly(dataBroker);
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
          expect(new DataBroker().pull(dataSourceSpec, options)).to.be.rejectedWith(
            /Please provide.*data source/,
          ),
        ),
      ));

    it('single code', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pull(DATA_SOURCE_SPECS.POP01, options);

      assertCreateServiceWasInvokedCorrectly(dataBroker);
      expect(serviceStub.pull).to.have.been.calledOnceWithExactly(
        [DATA_SOURCES.POP01],
        'dataElement',
        options,
      );
    });

    it('multiple codes', async () => {
      const dataBroker = new DataBroker();
      await dataBroker.pull({ code: ['POP01', 'POP02'], type: 'dataElement' }, options);

      assertCreateServiceWasInvokedCorrectly(dataBroker);
      expect(serviceStub.pull).to.have.been.calledOnceWithExactly(
        dataSources,
        'dataElement',
        options,
      );
    });
  });
});
