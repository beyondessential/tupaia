/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import sinon from 'sinon';
import { DhisApi } from '@tupaia/dhis-api';

import * as GetDhisApiInstance from '../../../services/dhis/getDhisApiInstance';
import { SERVER_NAME, DATA_ELEMENT_CODE_TO_ID } from './DhisService.fixtures';

export const setupDhisApiForStubbing = () => {
  sinon.stub(GetDhisApiInstance, 'getDhisApiInstance');
};

export const stubDhisApi = () => {
  const dhisApi = sinon.createStubInstance(DhisApi, {
    getIdsFromCodes: sinon
      .stub()
      .callsFake((_, codes) => codes.map(c => DATA_ELEMENT_CODE_TO_ID[c])),
    getServerName: SERVER_NAME,
    getResourceTypes: { DATA_ELEMENT: 'dataElement' },
  });
  GetDhisApiInstance.getDhisApiInstance.returns(dhisApi);
  return dhisApi;
};

export const cleanupDhisApiStub = () => {
  GetDhisApiInstance.getDhisApiInstance.restore();
};

export const stubModels = ({ dataSources }) => ({
  dataSource: {
    findOrDefault: specs =>
      dataSources.filter(({ code, type }) => specs.code.includes(code) && specs.type === type),
    getTypes: () => ({ DATA_ELEMENT: 'dataElement', DATA_GROUP: 'dataGroup' }),
  },
});
