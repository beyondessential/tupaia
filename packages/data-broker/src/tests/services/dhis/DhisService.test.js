/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DhisService } from '../../../services/dhis/DhisService';
import { stubModels, stubDhisApi, cleanupDhisApiStub, setupDhisApiForStubbing } from './helpers';
import {
  DATA_SOURCES,
  DATA_VALUES,
  DHIS_REFERENCE,
  DATA_ELEMENT_CODE_TO_ID,
  SERVER_NAME,
} from './DhisService.fixtures';

let dhisApi;
const modelsStub = stubModels({
  dataSources: Object.values(DATA_SOURCES),
});

describe('DhisService', () => {
  before(() => {
    setupDhisApiForStubbing();
  });
  after(() => {
    cleanupDhisApiStub();
  });

  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  describe('push()', () => {
    it('pushes a basic aggregate data element', async () => {
      await new DhisService(DATA_SOURCES.POP01, modelsStub).push(DATA_VALUES.POP01);
      expect(dhisApi.postDataValueSets).to.have.been.called.calledOnceWithExactly([
        { dataElement: 'POP01', value: 1 },
      ]);
    });

    it('pushes an aggregate data element with a different dhis code', async () => {
      const customDataSource = {
        ...DATA_SOURCES.POP01,
        config: { dataElementCode: 'DIF01' },
      };

      await new DhisService(customDataSource, modelsStub).push(DATA_VALUES.POP01);
      expect(dhisApi.postDataValueSets).to.have.been.called.calledOnceWithExactly([
        { dataElement: 'DIF01', value: 1 },
      ]);
    });

    it('pushes an event data group', async () => {
      const event = {
        otherField: 'otherValue',
        dataValues: [DATA_VALUES.POP01, DATA_VALUES.POP02],
      };

      await new DhisService(DATA_SOURCES.POP01_GROUP, modelsStub).push(event);
      expect(dhisApi.postEvents).to.have.been.called.calledOnceWithExactly([
        {
          ...event,
          dataValues: [
            { dataElement: DATA_ELEMENT_CODE_TO_ID.POP01, value: 1 },
            { dataElement: DATA_ELEMENT_CODE_TO_ID.POP02, value: 2 },
          ],
        },
      ]);
    });

    it('pushes an event data group with a different dhis code', async () => {
      const event = {
        otherField: 'otherValue',
        dataValues: [DATA_VALUES.POP01, DATA_VALUES.POP02],
      };
      const customDataSource = {
        ...DATA_SOURCES.POP01,
        config: { dataElementCode: 'DIF01' },
      };
      const customModelsStub = stubModels({
        dataSources: Object.values({
          ...DATA_SOURCES,
          POP01: customDataSource,
        }),
      });
      await new DhisService(DATA_SOURCES.POP01_GROUP, customModelsStub).push(event);
      expect(dhisApi.postEvents).to.have.been.called.calledOnceWithExactly([
        {
          ...event,
          dataValues: [
            {
              dataElement: 'id000DIF01',
              value: 1,
            },
            {
              dataElement: 'id000POP02',
              value: 2,
            },
          ],
        },
      ]);
    });
  });

  describe('delete()', () => {
    it('deletes a basic aggregate data element', async () => {
      await new DhisService(DATA_SOURCES.POP01, modelsStub).delete(DATA_VALUES.POP01, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteDataValue).to.have.been.called.calledOnceWithExactly({
        dataElement: 'POP01',
        value: 1,
      });
    });

    it('deletes an aggregate data element with a different dhis code', async () => {
      const customDataSource = {
        ...DATA_SOURCES.POP01,
        config: { dataElementCode: 'DIF01' },
      };

      await new DhisService(customDataSource, modelsStub).delete(DATA_VALUES.POP01, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteDataValue).to.have.been.called.calledOnceWithExactly({
        dataElement: 'DIF01',
        value: 1,
      });
    });

    it('deletes an event', async () => {
      const eventData = {
        dhisReference: DHIS_REFERENCE,
      };

      await new DhisService(DATA_SOURCES.POP01_GROUP, modelsStub).delete(eventData, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteEvent).to.have.been.called.calledOnceWithExactly(DHIS_REFERENCE);
    });
  });
});
