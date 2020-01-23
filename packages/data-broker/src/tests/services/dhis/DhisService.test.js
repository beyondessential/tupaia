/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { DhisService } from '../../../services/dhis/DhisService';
import * as GetDhisApiInstance from '../../../services/dhis/getDhisApiInstance';
import { createModelsStub, createDhisApiStub } from './helpers';
import { BASIC_DATA_SOURCE, SERVER_NAME } from './dhisService.fixtures';

const modelsStub = createModelsStub({ dataSources: [BASIC_DATA_SOURCE] });
let dhisApi;

describe.only('DhisService', () => {
  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = createDhisApiStub();
    sinon.stub(GetDhisApiInstance, 'getDhisApiInstance').returns(dhisApi);
    sinon.stub(GetDhisApiInstance, 'getServerName').returns(SERVER_NAME);
  });

  afterEach(() => {
    GetDhisApiInstance.getDhisApiInstance.restore();
    GetDhisApiInstance.getServerName.restore();
  });

  describe('push()', () => {
    it('pushes a basic aggregate data element', async () => {
      // set up test data
      const dataValue = { code: BASIC_DATA_SOURCE.code, value: 2 };
      const translatedDataValue = { dataElement: BASIC_DATA_SOURCE.code, value: 2 };

      await new DhisService(BASIC_DATA_SOURCE, modelsStub).push(dataValue);
      expect(dhisApi.postDataValueSets).to.have.been.called.calledOnceWithExactly([
        translatedDataValue,
      ]);
    });
  });
});
