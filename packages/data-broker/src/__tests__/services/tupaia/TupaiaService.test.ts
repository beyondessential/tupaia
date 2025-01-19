import { TupaiaService } from '../../../services/tupaia/TupaiaService';
import { createTupaiaDataApiStub } from './TupaiaService.stubs';
import {
  ANALYTICS,
  EVENTS,
  DATA_ELEMENTS,
  DATA_ELEMENT_METADATA,
  DATA_GROUPS,
} from './TupaiaService.fixtures';
import { DataBrokerModelRegistry } from '../../../types';
import { DataServiceMapping } from '../../../services/DataServiceMapping';

const models = {} as DataBrokerModelRegistry;
const tupaiaDataApi = createTupaiaDataApiStub({
  fetchAnalyticsResponse: ANALYTICS,
  fetchEventsResponse: EVENTS,
});
const tupaiaService = new TupaiaService(models, tupaiaDataApi);
const dataServiceMapping = new DataServiceMapping();

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
        await tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01], {
          dataServiceMapping,
        });
        expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01'] }),
        );
      });

      it('multiple data elements', async () => {
        await tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
          dataServiceMapping,
        });
        expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataElementCodes: ['POP01', 'POP02'] }),
        );
      });

      it('converts period to start and end dates', async () => {
        await tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
          dataServiceMapping,
          period: '20200822',
        });
        expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
          expect.objectContaining({ startDate: '2020-08-22', endDate: '2020-08-22' }),
        );
      });

      it('supports various API options', async () => {
        const options = {
          dataServiceMapping,
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
          { dataServiceMapping },
        );
        expect(response).toHaveProperty('results');
        expect(response).toHaveProperty('metadata');
        expect(response).toHaveProperty('numAggregationsProcessed');
      });

      it('returns the analytics API response in the `results` field', () =>
        expect(
          tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
            dataServiceMapping,
          }),
        ).resolves.toHaveProperty('results', ANALYTICS.analytics));

      it('correctly builds the `metadata` field', () =>
        expect(
          tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
            dataServiceMapping,
          }),
        ).resolves.toHaveProperty('metadata', {
          dataElementCodeToName: {
            POP01: 'Population 1',
            POP02: 'Population 2',
          },
        }));

      it('returns the analytics API aggregations processed in the `numAggregationsProcessed` field', () =>
        expect(
          tupaiaService.pullAnalytics([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], {
            dataServiceMapping,
          }),
        ).resolves.toHaveProperty('numAggregationsProcessed', ANALYTICS.numAggregationsProcessed));
    });
  });

  describe('pullEvents', () => {
    it('throws an error if multiple data groups are provided', () =>
      expect(
        tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP, DATA_GROUPS.POP02_GROUP], {
          dataServiceMapping,
        }),
      ).toBeRejectedWith(/Cannot .*multiple programs/));

    it('uses the data group code as `dataGroupCode`', async () => {
      await tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP], {
        dataServiceMapping,
      });
      expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ dataGroupCode: 'POP01' }),
      );
    });

    it('converts period to start and end dates', async () => {
      await tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP], {
        dataServiceMapping,
        period: '20200822',
      });
      expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(
        expect.objectContaining({ startDate: '2020-08-22', endDate: '2020-08-22' }),
      );
    });

    it('supports various API options', async () => {
      const options = {
        dataServiceMapping,
        dataElementCodes: ['POP01', 'POP02'],
        organisationUnitCodes: ['TO', 'PG'],
        startDate: '20200731',
        endDate: '20200904',
      };

      await tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP], options);
      expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(expect.objectContaining(options));
    });

    it('directly returns the event API response', () =>
      expect(
        tupaiaService.pullEvents([DATA_GROUPS.POP01_GROUP], { dataServiceMapping }),
      ).resolves.toStrictEqual(EVENTS));
  });

  describe('pullSyncGroupResults()', () => {
    it('throws an error', async () =>
      expect(tupaiaService.pullSyncGroupResults()).toBeRejectedWith('not supported'));
  });

  describe('pullMetadata()', () => {
    describe('data element', () => {
      it('single code', () =>
        expect(
          tupaiaService.pullMetadata([DATA_ELEMENTS.POP01], 'dataElement', { dataServiceMapping }),
        ).resolves.toStrictEqual([DATA_ELEMENT_METADATA.POP01]));

      it('multiple codes', () =>
        expect(
          tupaiaService.pullMetadata([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], 'dataElement', {
            dataServiceMapping,
          }),
        ).resolves.toStrictEqual([DATA_ELEMENT_METADATA.POP01, DATA_ELEMENT_METADATA.POP02]));
    });
  });
});
