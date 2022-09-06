/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  createApiStub,
  createModelsStub,
  DATA_ELEMENTS,
  DEFAULT_DATA_SERVICE_MAPPING,
  stubGetSupersetApi,
  SUPERSET_CHART_DATA_RESPONSE,
} from './SupersetService.stubs';
import { SupersetService } from '../../../services/superset/SupersetService';
import { DataServiceMapping } from '../../../services/DataServiceMapping';
import { getSupersetApiInstance } from '../../../services/superset/getSupersetApi';

const models = createModelsStub();
const mockApi = {
  chartData: () => SUPERSET_CHART_DATA_RESPONSE,
};
jest.mock('@tupaia/superset-api', () => ({
  SupersetApi: jest.fn().mockImplementation(() => mockApi),
}));

describe('SupersetService', () => {
  let supersetService;

  beforeEach(() => {
    supersetService = new SupersetService(models);
    stubGetSupersetApi(createApiStub());
  });

  describe('push()', () => {
    it('throws an error', () => expect(supersetService.push()).toBeRejectedWith('not supported'));
  });

  describe('delete()', () => {
    it('throws an error', () => expect(supersetService.delete()).toBeRejectedWith('not supported'));
  });

  describe('pull()', () => {
    describe('pullAnalytics()', () => {
      it('pulls', () =>
        expect(
          supersetService.pull([DATA_ELEMENTS.ITEM_1], 'dataElement', {
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          }),
        ).resolves.toEqual({
          metadata: {
            dataElementCodeToName: {},
          },
          results: [
            {
              dataElement: 'ITEM_1',
              organisationUnit: 'STORE_1',
              period: '20200101',
              value: 1,
            },
            {
              dataElement: 'ITEM_1',
              organisationUnit: 'STORE_2',
              period: '20200101',
              value: 2,
            },
          ],
        }));

      it('uses mapping to find which superset instance to use', async () => {
        await supersetService.pull([DATA_ELEMENTS.ITEM_1], 'dataElement', {
          dataServiceMapping: new DataServiceMapping([
            {
              dataSource: DATA_ELEMENTS.ITEM_1,
              service_type: 'superset',
              config: { supersetInstanceCode: 'SUPERSET_INSTANCE_B' }, // different
            },
          ]),
        });

        return expect(getSupersetApiInstance).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            code: 'SUPERSET_INSTANCE_B',
          }),
        );
      });

      it('uses supersetItemCode as a fallback', () =>
        expect(
          supersetService.pull([DATA_ELEMENTS.ITEM_2_CUSTOM_CODE], 'dataElement', {
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          }),
        ).resolves.toEqual({
          metadata: expect.anything(),
          results: [
            {
              dataElement: 'ITEM_2_CUSTOM_CODE',
              organisationUnit: 'STORE_1',
              period: '20200101',
              value: 3,
            },
            {
              dataElement: 'ITEM_2_CUSTOM_CODE',
              organisationUnit: 'STORE_2',
              period: '20200101',
              value: 4,
            },
          ],
        }));

      it('throws if supersetChartId not set', () =>
        expect(
          supersetService.pull([DATA_ELEMENTS.DE_NO_CHART_ID], 'dataElement', {
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          }),
        ).toBeRejectedWith('Data Element DE_NO_CHART_ID missing supersetChartId'));
    });

    describe('pullEvents()', () => {
      it('throws an error', () =>
        expect(supersetService.pull({}, 'dataGroup')).toBeRejectedWith('not supported'));
    });

    describe('pullSyncGroups()', () => {
      it('throws an error', () =>
        expect(supersetService.pull({}, 'syncGroup')).toBeRejectedWith('not supported'));
    });
  });

  describe('pullMetadata()', () => {
    it('throws an error', () =>
      expect(supersetService.pullMetadata()).toBeRejectedWith('not supported'));
  });
});
