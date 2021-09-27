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
dhisService.deprecatedEventsPuller = {
  pull: jest.fn(),
};
dhisService.pullers.dataElement = dhisService.analyticsPuller.pull;
dhisService.pullers.dataGroup = dhisService.eventsPuller.pull;
dhisService.pullers.dataGroup_deprecated = dhisService.deprecatedEventsPuller.pull;

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



  describe('events - deprecated API', testPullEvents_Deprecated);
};
