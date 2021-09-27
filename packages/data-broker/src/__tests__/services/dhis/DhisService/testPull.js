/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { testPullEvents_Deprecated } from './testPull/testPullEvents_Deprecated';
import { DhisService } from '../../../../services/dhis';
import { createModelsStub } from './DhisService.stubs';
import { DATA_SOURCES } from './DhisService.fixtures';
import * as GetDhisApiInstance from '../../../../services/dhis/getDhisApiInstance';

const dhisService = new DhisService(createModelsStub());
dhisService.analyticsPuller = {
  pull: jest.fn(),
};
dhisService.eventsPuller = {
  pull: jest.fn(),
};
dhisService.pullers.dataElement = dhisService.analyticsPuller.pull;
dhisService.pullers.dataGroup = dhisService.eventsPuller.pull;

export const testPull = () => {
  describe('pulls', () => {
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
  });



  describe('events - deprecated API', testPullEvents_Deprecated);
};
