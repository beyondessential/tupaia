/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';

import * as GetModels from '../../getModels';
import * as CreateService from '../../services/createService';
import { Service } from '../../services/Service';

const getModels = {
  stub: models => sinon.stub(GetModels, 'getModels').returns(models),
  restore: () => {
    GetModels.getModels.restore();
  },
};

const createService = {
  stub: service => sinon.stub(CreateService, 'createService').returns(service),
  restore: () => {
    CreateService.createService.restore();
  },
};

export const models = {
  getStub: ({ dataSources }) => ({
    dataSource: {
      findOneOrDefault: spec =>
        dataSources.find(({ code, type }) => spec.code === code && spec.type === type),
      findOrDefault: spec =>
        dataSources.filter(({ code, type }) => spec.code.includes(code) && spec.type === type),
      getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
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
  createService,
  models,
  service,
};
