/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import sinon from 'sinon';
import { DhisApi } from '@tupaia/dhis-api';

import * as GetDhisApiInstance from '../../../services/dhis/getDhisApiInstance';
import { SERVER_NAME, DATA_ELEMENT_CODE_TO_ID } from './dhisService.fixtures';

export const setupDhisApiForStubbing = () => {
  sinon.stub(GetDhisApiInstance, 'getDhisApiInstance');
  sinon.stub(GetDhisApiInstance, 'getServerName').returns(SERVER_NAME);
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
  GetDhisApiInstance.getServerName.restore();
};

export const stubModels = ({ dataSources }) => ({
  DataSource: {
    fetchManyFromDbOrDefault: specs =>
      specs.map(({ code }) => dataSources.find(dataSource => dataSource.code === code)),
    types: {
      DATA_ELEMENT: 'dataElement',
      DATA_GROUP: 'dataGroup',
    },
  },
});
