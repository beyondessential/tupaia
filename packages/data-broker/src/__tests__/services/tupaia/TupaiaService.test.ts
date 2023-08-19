/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaService } from '../../../services/tupaia/TupaiaService';
import { createTupaiaDataApiStub } from './TupaiaService.stubs';
import {
  ANALYTICS,
  EVENTS,
  DATA_ELEMENTS,
  DATA_ELEMENTS_BY_GROUP,
  DATA_ELEMENT_METADATA,
  DATA_GROUPS,
  DATA_GROUP_METADATA,
} from './TupaiaService.fixtures';
import { DataBrokerModelRegistry } from '../../../types';

const models = {
  dataGroup: {
    getDataElementsInDataGroup: async (groupCode: string) =>
      DATA_ELEMENTS_BY_GROUP[groupCode as keyof typeof DATA_ELEMENTS_BY_GROUP] || [],
  },
} as DataBrokerModelRegistry;
const tupaiaDataApi = createTupaiaDataApiStub({
  fetchAnalyticsResponse: ANALYTICS,
  fetchEventsResponse: EVENTS,
});
const tupaiaService = new TupaiaService(models, tupaiaDataApi);

describe('TupaiaService', () => {
  describe('push()', () => {
    it('throws an error', () => expect(tupaiaService.push()).toBeRejectedWith('not supported'));
  });

  describe('delete()', () => {
    it('throws an error', () => expect(tupaiaService.delete()).toBeRejectedWith('not supported'));
  });

  describe('pullAnalytics', () => {
    describe('Tupaia data API invocation', () => {
      it('single data element', async () => {
        await tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01], {});
        expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01'] }),
        );
      });

      it('multiple data elements', async () => {
        await tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {});
        expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01', 'POP02'] }),
        );
      });

      it('converts period to start and end dates', async () => {
        await tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
          period: '20200822',
        });
        expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ startDate: '2020-08-22', endDate: '2020-08-22' }),
        );
      });

      it('supports various API options', async () => {
        const options = {
          organisationUnitCodes: ['TO', 'PG'],
          startDate: '20200731',
          endDate: '20200904',
        };

        await tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01], options);
        expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining(options),
        );
      });
    });

    describe('data pulling', () => {
      it('returns a { results, metadata, numAggregationsProcessed } response', async () => {
        const response = await tupaiaService.pullAnalytics(
          [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
          {},
        );
        expect(response).toHaveProperty('results');
        expect(response).toHaveProperty('metadata');
        expect(response).toHaveProperty('numAggregationsProcessed');
      });

      it('returns the analytics API response in the `results` field', () =>
        expect(
          tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {}),
        ).resolves.toHaveProperty('results', ANALYTICS.analytics));

      it('correctly builds the `metadata` field', () =>
        expect(
          tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {}),
        ).resolves.toHaveProperty('metadata', {
          dataElementCodeToName: {
            POP01: 'Population 1',
            POP02: 'Population 2',
          },
        }));

      it('returns the analytics API aggregations processed in the `numAggregationsProcessed` field', () =>
        expect(
          tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {}),
        ).resolves.toHaveProperty('numAggregationsProcessed', ANALYTICS.numAggregationsProcessed));
    });
  });

  describe('pullEvents', () => {
    it('throws an error if multiple data groups are provided', () =>
      expect(
        tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP, DATA_GROUPS.POP02_GROUP], {}),
      ).toBeRejectedWith(/Cannot .*multiple programs/));

    it('uses the data group code as `dataGroupCode`', async () => {
      await tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP], {});
      expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ dataGroupCode: 'POP01' }),
      );
    });

    it('converts period to start and end dates', async () => {
      await tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP], {
        period: '20200822',
      });
      expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ startDate: '2020-08-22', endDate: '2020-08-22' }),
      );
    });

    it('supports various API options', async () => {
      const options = {
        dataElementCodes: ['POP01', 'POP02'],
        organisationUnitCodes: ['TO', 'PG'],
        startDate: '20200731',
        endDate: '20200904',
      };

      await tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP], options);
      expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(expect.objectContaining(options));
    });

    it('directly returns the event API response', () =>
      expect(tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP], {})).resolves.toStrictEqual(
        EVENTS,
      ));
  });

  describe('pullSyncGroupResults()', () => {
    it('throws an error', async () =>
      expect(tupaiaService.pullSyncGroupResults()).toBeRejectedWith('not supported'));
  });

  describe('pullDataElementMetadata()', () => {
    it('uses Tupaia API to pull metadata', async () => {
      await expect(
        tupaiaService.pullDataElementMetadata([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {}),
      ).resolves.toStrictEqual([DATA_ELEMENT_METADATA.POP01, DATA_ELEMENT_METADATA.POP02]);
    });

    it('supports including options', async () => {
      await tupaiaService.pullDataElementMetadata([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
        includeOptions: true,
      });

      expect(tupaiaDataApi.fetchDataElements).toHaveBeenCalledOnceWith(['POP01', 'POP02'], {
        includeOptions: true,
      });
    });
  });

  describe('pullDataGroupMetadata', () => {
    it('uses Tupaia API to pull metadata', async () => {
      await expect(
        tupaiaService.pullDataGroupMetadata(DATA_GROUPS.POP01_GROUP, {}),
      ).resolves.toStrictEqual({
        ...DATA_GROUP_METADATA.POP01,
        dataElements: [DATA_ELEMENT_METADATA.POP01, DATA_ELEMENT_METADATA.POP02],
      });
    });

    it('supports including options', async () => {
      await tupaiaService.pullDataGroupMetadata(DATA_GROUPS.POP01_GROUP, { includeOptions: true });

      expect(tupaiaDataApi.fetchDataGroup).toHaveBeenCalledOnceWith('POP01', ['POP01', 'POP02'], {
        includeOptions: true,
      });
    });
  });
});
