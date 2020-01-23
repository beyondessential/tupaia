/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';

import * as GetModels from '../getModels';
import * as GetServiceFromDataSource from '../services/getServiceFromDataSource';
import { Service } from '../services/Service';

const getModels = {
  stub: models => sinon.stub(GetModels, 'getModels').returns(models),
  restore: () => {
    GetModels.getModels.restore();
  },
};

const getServiceFromDataSource = {
  stub: service =>
    sinon.stub(GetServiceFromDataSource, 'getServiceFromDataSource').returns(service),
  restore: () => {
    GetServiceFromDataSource.getServiceFromDataSource.restore();
  },
};

export const models = {
  getStub: ({ dataSources }) => ({
    dataSource: {
      fetchFromDbOrDefault: ({ code, type }) =>
        dataSources.find(
          dataSource => dataSource.code === code && dataSource.service_type === type,
        ) || null,
    },
  }),
};

export const service = {
  getStub: () =>
    sinon.createStubInstance(Service, {
      push: sinon.stub(),
      delete: sinon.stub(),
      pull: sinon.stub(),
    }),
};

export const stubs = {
  getModels,
  getServiceFromDataSource,
  models,
  service,
};
