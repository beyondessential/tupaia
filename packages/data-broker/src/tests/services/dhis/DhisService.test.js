/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DhisService } from '../../../services/dhis/DhisService';
import { stubModels, stubDhisApi, cleanupDhisApiStub, setupDhisApiForStubbing } from './helpers';
import {
  CODE_1,
  CODE_2,
  DIFFERENT_CODE,
  DHIS_REFERENCE,
  DATA_ELEMENT_CODE_TO_ID,
  DATA_VALUE_1,
  DATA_VALUE_2,
  DATA_GROUP_DATA_SOURCE,
  DATA_SOURCE_1,
  DATA_SOURCE_2,
  UNUSED_DATA_SOURCE,
  SERVER_NAME,
} from './dhisService.fixtures';

let dhisApi;
const modelsStub = stubModels({
  dataSources: [DATA_GROUP_DATA_SOURCE, DATA_SOURCE_1, DATA_SOURCE_2, UNUSED_DATA_SOURCE],
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
      const translatedDataValue = { dataElement: CODE_1, value: DATA_VALUE_1.value };

      await new DhisService(DATA_SOURCE_1, modelsStub).push(DATA_VALUE_1);
      expect(dhisApi.postDataValueSets).to.have.been.called.calledOnceWithExactly([
        translatedDataValue,
      ]);
    });

    it('pushes an aggregate data element with a different dhis code', async () => {
      const dataSource = {
        ...DATA_SOURCE_1,
        config: { ...DATA_SOURCE_1.config, dataElementCode: DIFFERENT_CODE },
      };
      const translatedDataValue = { dataElement: DIFFERENT_CODE, value: DATA_VALUE_1.value };

      await new DhisService(dataSource, modelsStub).push(DATA_VALUE_1);
      expect(dhisApi.postDataValueSets).to.have.been.called.calledOnceWithExactly([
        translatedDataValue,
      ]);
    });

    it('pushes an event data group', async () => {
      const event = {
        otherField: 'otherValue',
        dataValues: [DATA_VALUE_1, DATA_VALUE_2],
      };
      const translatedEvent = {
        ...event,
        dataValues: [
          { dataElement: DATA_ELEMENT_CODE_TO_ID[CODE_1], value: DATA_VALUE_1.value },
          { dataElement: DATA_ELEMENT_CODE_TO_ID[CODE_2], value: DATA_VALUE_2.value },
        ],
      };

      await new DhisService(DATA_GROUP_DATA_SOURCE, modelsStub).push(event);
      expect(dhisApi.postEvents).to.have.been.called.calledOnceWithExactly([translatedEvent]);
    });

    it('pushes an event data group with a different dhis code', async () => {
      const event = {
        otherField: 'otherValue',
        dataValues: [DATA_VALUE_1, DATA_VALUE_2],
      };
      const translatedEvent = {
        ...event,
        dataValues: [
          { dataElement: DATA_ELEMENT_CODE_TO_ID[CODE_1], value: DATA_VALUE_1.value },
          { dataElement: DATA_ELEMENT_CODE_TO_ID[DIFFERENT_CODE], value: DATA_VALUE_2.value },
        ],
      };
      const customDataSource2 = {
        ...DATA_SOURCE_2,
        config: { ...DATA_SOURCE_2.config, dataElementCode: DIFFERENT_CODE },
      };
      const customModelsStub = stubModels({
        dataSources: [DATA_GROUP_DATA_SOURCE, DATA_SOURCE_1, customDataSource2, UNUSED_DATA_SOURCE],
      });
      await new DhisService(DATA_GROUP_DATA_SOURCE, customModelsStub).push(event);
      expect(dhisApi.postEvents).to.have.been.called.calledOnceWithExactly([translatedEvent]);
    });
  });

  describe('delete()', () => {
    it('deletes a basic aggregate data element', async () => {
      const translatedDataValue = { dataElement: CODE_1, value: DATA_VALUE_1.value };

      await new DhisService(DATA_SOURCE_1, modelsStub).delete(DATA_VALUE_1, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteDataValue).to.have.been.called.calledOnceWithExactly(
        translatedDataValue,
      );
    });

    it('deletes an aggregate data element with a different dhis code', async () => {
      const dataSource = {
        ...DATA_SOURCE_1,
        config: { ...DATA_SOURCE_1.config, dataElementCode: DIFFERENT_CODE },
      };
      const translatedDataValue = { dataElement: DIFFERENT_CODE, value: DATA_VALUE_1.value };

      await new DhisService(dataSource, modelsStub).delete(DATA_VALUE_1, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteDataValue).to.have.been.called.calledOnceWithExactly(
        translatedDataValue,
      );
    });

    it('deletes an event', async () => {
      const eventData = {
        dhisReference: DHIS_REFERENCE,
      };

      await new DhisService(DATA_GROUP_DATA_SOURCE, modelsStub).delete(eventData, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteEvent).to.have.been.called.calledOnceWithExactly(DHIS_REFERENCE);
    });
  });
});
