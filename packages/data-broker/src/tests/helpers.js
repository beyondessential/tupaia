/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';

import * as GetModels from '../getModels';
import * as Services from '../services';
import { Service } from '../services/Service';

export const TEST_SERVICE_TYPE = 'testServiceType';

const getModels = {
  stub: ({ dataSources }) =>
    sinon.stub(GetModels, 'getModels').returns({
      dataSource: {
        findOne: ({ code }) => dataSources[code],
      },
    }),
  restore: () => {
    GetModels.getModels.restore();
  },
};

const getServiceFromDataSource = {
  stub: service => sinon.stub(Services, 'getServiceFromDataSource').returns(service),
  restore: () => {
    Services.getServiceFromDataSource.restore();
  },
};

export const service = {
  getStub: () =>
    sinon.createStubInstance(Service, {
      push: sinon.stub(),
      pull: sinon.stub(),
    }),
};

export const stubs = {
  getModels,
  getServiceFromDataSource,
  service,
};
