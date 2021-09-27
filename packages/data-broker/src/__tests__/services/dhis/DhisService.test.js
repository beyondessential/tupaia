/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import * as GetDhisApiInstance from '../../../services/dhis/getDhisApiInstance';
import { DATA_SOURCES, DATA_VALUES, DHIS_REFERENCE, SERVER_NAME } from './DhisService.fixtures';
import { DhisService } from '../../../services/dhis';
import { createModelsStub, stubDhisApi } from './DhisService.stubs';

describe('DhisService', () => {
  let dhisService;

  beforeEach(() => {
    dhisService = new DhisService(createModelsStub());
    dhisService.analyticsPuller = {
      pull: jest.fn(),
    };
    dhisService.eventsPuller = {
      pull: jest.fn(),
    };
    dhisService.deprecatedEventsPuller = {
      pull: jest.fn(),
    };
    dhisService.pullers.dataElement = dhisService.analyticsPuller.pull;
    dhisService.pullers.dataGroup = dhisService.eventsPuller.pull;
    dhisService.pullers.dataGroup_deprecated = dhisService.deprecatedEventsPuller.pull;
  });

  describe('push()', () => {
    let dhisApi;

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
        await dhisService.push([DATA_SOURCES.DIF01], DATA_VALUES.DIF01);
        expect(dhisApi.postDataValueSets).toHaveBeenCalledOnceWith([
          { dataElement: 'DIF01_DHIS', value: '3' },
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
  });

  describe('delete()', () => {
    let dhisApi;

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
  });

  describe('pull()', () => {
    beforeEach(() => {
      jest.spyOn(GetDhisApiInstance, 'getDhisApiInstance')
        .mockReturnValueOnce({ myDhisApi: 1 })
    });

    it('uses AnalyticsPuller for dataElements', async () => {
      await dhisService.pull( [DATA_SOURCES.POP01], 'dataElement', {});
      expect(dhisService.analyticsPuller.pull)
      .toHaveBeenCalledOnceWith([{ myDhisApi: 1 }], [DATA_SOURCES.POP01], {});
    });

    it('uses EventsPuller for dataGroups', async () => {
      await dhisService.pull( [DATA_SOURCES.POP01_GROUP], 'dataGroup', {});
      expect(dhisService.eventsPuller.pull)
      .toHaveBeenCalledOnceWith([{ myDhisApi: 1 }], [DATA_SOURCES.POP01_GROUP], {});
    });

    it('uses the modern EventsPuller by default', async () => {
      await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {});
      expect(dhisService.eventsPuller.pull).toHaveBeenCalledTimes(1);
      expect(dhisService.deprecatedEventsPuller.pull).not.toHaveBeenCalled();
    });

    it('uses the deprecated EventsPuller if flag passed', async () => {
      await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', { useDeprecatedApi: true });
      expect(dhisService.eventsPuller.pull).not.toHaveBeenCalled();
      expect(dhisService.deprecatedEventsPuller.pull).toHaveBeenCalledTimes(1);
    });
  });
});
