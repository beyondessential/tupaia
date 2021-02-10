/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DhisService } from '../../../../services/dhis/DhisService';
import { DATA_SOURCES, DATA_VALUES, DHIS_REFERENCE, SERVER_NAME } from './DhisService.fixtures';
import { createModelsStub, stubDhisApi } from './DhisService.stubs';

const dhisService = new DhisService(createModelsStub());
let dhisApi;

export const testDelete = () => {
  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  describe('data element', () => {
    it('deletes a basic aggregate data element', async () => {
      await dhisService.delete(DATA_SOURCES.POP01, DATA_VALUES.POP01, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteDataValue).toHaveBeenCalledOnceWith({
        dataElement: 'POP01',
        value: '1',
      });
    });

    it('deletes an aggregate data element with a different dhis code', async () => {
      await dhisService.delete(DATA_SOURCES.DIF01, DATA_VALUES.DIF01, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteDataValue).toHaveBeenCalledOnceWith({
        dataElement: 'DIF01_DHIS',
        value: '3',
      });
    });
  });

  describe('data group', () => {
    it('deletes an event', async () => {
      const eventData = {
        dhisReference: DHIS_REFERENCE,
      };

      await dhisService.delete(DATA_SOURCES.POP01_GROUP, eventData, {
        serverName: SERVER_NAME,
      });
      expect(dhisApi.deleteEvent).toHaveBeenCalledOnceWith(DHIS_REFERENCE);
    });
  });
};
