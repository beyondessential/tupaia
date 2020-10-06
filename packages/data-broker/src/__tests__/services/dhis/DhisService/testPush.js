/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { DhisService } from '../../../../services/dhis/DhisService';
import { DATA_SOURCES, DATA_VALUES } from './DhisService.fixtures';
import { createModelsStub, stubDhisApi } from './DhisService.stubs';

const dhisService = new DhisService(createModelsStub());
let dhisApi;

export const testPush = () => {
  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  describe('data element', () => {
    it('basic aggregate data element', async () => {
      await dhisService.push([DATA_SOURCES.POP01], DATA_VALUES.POP01);
      expect(dhisApi.postDataValueSets).toHaveBeenCalledOnceWith([
        { dataElement: 'POP01', value: '1' },
      ]);
    });

    it('aggregate data element with a different dhis code', async () => {
      await dhisService.push([DATA_SOURCES.DIF01], DATA_VALUES.POP01);
      expect(dhisApi.postDataValueSets).toHaveBeenCalledOnceWith([
        { dataElement: 'DIF01_DHIS', value: '1' },
      ]);
    });
  });

  describe('data group', () => {
    it('event data group', async () => {
      const event = {
        otherField: 'otherValue',
        dataValues: [DATA_VALUES.POP01, DATA_VALUES.POP02],
      };

      await dhisService.push([DATA_SOURCES.POP01_GROUP], event);
      expect(dhisApi.postEvents).toHaveBeenCalledOnceWith([
        {
          ...event,
          dataValues: [
            { dataElement: 'id000POP01', value: '1' },
            { dataElement: 'id000POP02', value: '2' },
          ],
        },
      ]);
    });

    it('event data group with a different dhis code', async () => {
      const event = {
        otherField: 'otherValue',
        dataValues: [DATA_VALUES.POP01, DATA_VALUES.DIF01],
      };

      await dhisService.push([DATA_SOURCES.POP01_GROUP], event);
      expect(dhisApi.postEvents).toHaveBeenCalledOnceWith([
        {
          ...event,
          dataValues: [
            {
              dataElement: 'id000POP01',
              value: '1',
            },
            {
              dataElement: 'id000DIF01_DHIS',
              value: '3',
            },
          ],
        },
      ]);
    });
  });
};
