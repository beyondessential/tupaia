/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  createApiStub,
  createModelsStub,
  DATA_ELEMENTS,
  DEFAULT_DATA_SERVICE_MAPPING,
  DEFAULT_ORG_UNIT_CODES,
  DEFAULT_PULL_OPTIONS,
  stubGetSupersetApi,
  SUPERSET_CHART_DATA_RESPONSE,
} from './SupersetService.stubs';
import { SupersetService } from '../../../services/superset';
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
  let supersetService: SupersetService;

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
          supersetService.pull([DATA_ELEMENTS.ITEM_1], 'dataElement', DEFAULT_PULL_OPTIONS),
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
              config: { supersetInstanceCode: 'SUPERSET_INSTANCE_B', supersetChartId: 456 }, // different
            },
          ]),
          organisationUnitCodes: DEFAULT_ORG_UNIT_CODES,
        });

        expect(getSupersetApiInstance).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            code: 'SUPERSET_INSTANCE_B',
          }),
        );
      });

      it('uses supersetItemCode as a fallback', () =>
        expect(
          supersetService.pull(
            [DATA_ELEMENTS.ITEM_2_CUSTOM_CODE],
            'dataElement',
            DEFAULT_PULL_OPTIONS,
          ),
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
          supersetService.pull([DATA_ELEMENTS.DE_NO_CHART_ID], 'dataElement', DEFAULT_PULL_OPTIONS),
        ).toBeRejectedWith('Data Element DE_NO_CHART_ID missing supersetChartId'));

      it('filters by the org units you specify', () =>
        expect(
          supersetService.pull([DATA_ELEMENTS.ITEM_1], 'dataElement', {
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
            organisationUnitCode: 'STORE_1',
          }),
        ).resolves.toEqual({
          metadata: expect.anything(),
          results: [
            {
              dataElement: 'ITEM_1',
              organisationUnit: 'STORE_1',
              period: '20200101',
              value: 1,
            },
          ],
        }));

      it('returns data for all org units if no org units specified', () =>
        expect(
          supersetService.pull([DATA_ELEMENTS.ITEM_1], 'dataElement', {
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
            organisationUnitCodes: [],
          }),
        ).resolves.toEqual({
          metadata: expect.anything(),
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

      it('ignores non-superset data elements', () =>
        expect(
          supersetService.pull([DATA_ELEMENTS.DE_NOT_SUPERSET], 'dataElement', {
            dataServiceMapping: DEFAULT_DATA_SERVICE_MAPPING,
          }),
        ).resolves.toEqual({
          metadata: {
            dataElementCodeToName: {},
          },
          results: [],
        }));
    });

    describe('pullEvents()', () => {
      it('throws an error', () =>
        expect(
          supersetService.pull([], 'dataGroup', { dataServiceMapping: new DataServiceMapping() }),
        ).toBeRejectedWith('not supported'));
    });

    describe('pullSyncGroups()', () => {
      it('throws an error', () =>
        expect(
          supersetService.pull([], 'dataGroup', { dataServiceMapping: new DataServiceMapping() }),
        ).toBeRejectedWith('not supported'));
    });
  });

  describe('pullMetadata()', () => {
    it('default implementation', () =>
      expect(
        supersetService.pullMetadata([], 'dataElement', {
          dataServiceMapping: new DataServiceMapping(),
        }),
      ).resolves.toEqual([]));
  });
});
