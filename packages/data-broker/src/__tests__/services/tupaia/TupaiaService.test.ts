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
  DATA_ELEMENT_METADATA,
  DATA_GROUPS,
} from './TupaiaService.fixtures';
import { DataBrokerModelRegistry } from '../../../types';

const models = {} as DataBrokerModelRegistry;
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

  describe('pull()', () => {
    describe('data element', () => {
      describe('Tupaia data API invocation', () => {
        it('single data element', async () => {
          await tupaiaService.pull([DATA_ELEMENTS.POP01], 'dataElement');
          expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
            expect.objectContaining({ dataElementCodes: ['POP01'] }),
          );
        });

        it('multiple data elements', async () => {
          await tupaiaService.pull([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], 'dataElement');
          expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
            expect.objectContaining({ dataElementCodes: ['POP01', 'POP02'] }),
          );
        });

        it('converts period to start and end dates', async () => {
          await tupaiaService.pull([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], 'dataElement', {
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

          await tupaiaService.pull([DATA_ELEMENTS.POP01], 'dataElement', options);
          expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(
            expect.objectContaining(options),
          );
        });
      });

      describe('data pulling', () => {
        it('returns a { results, metadata, numAggregationsProcessed } response', async () => {
          const response = await tupaiaService.pull(
            [DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02],
            'dataElement',
          );
          expect(response).toHaveProperty('results');
          expect(response).toHaveProperty('metadata');
          expect(response).toHaveProperty('numAggregationsProcessed');
        });

        it('returns the analytics API response in the `results` field', () =>
          expect(
            tupaiaService.pull([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], 'dataElement'),
          ).resolves.toHaveProperty('results', ANALYTICS.analytics));

        it('correctly builds the `metadata` field', () =>
          expect(
            tupaiaService.pull([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], 'dataElement'),
          ).resolves.toHaveProperty('metadata', {
            dataElementCodeToName: {
              POP01: 'Population 1',
              POP02: 'Population 2',
            },
          }));

        it('returns the analytics API aggregations processed in the `numAggregationsProcessed` field', () =>
          expect(
            tupaiaService.pull([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], 'dataElement'),
          ).resolves.toHaveProperty(
            'numAggregationsProcessed',
            ANALYTICS.numAggregationsProcessed,
          ));
      });
    });

    describe('data group', () => {
      it('throws an error if multiple data groups are provided', () =>
        expect(
          tupaiaService.pull([DATA_GROUPS.POP01_GROUP, DATA_GROUPS.POP02_GROUP], 'dataGroup', {}),
        ).toBeRejectedWith(/Cannot .*multiple programs/));

      it('uses the data group code as `dataGroupCode`', async () => {
        await tupaiaService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup');
        expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(
          expect.objectContaining({ dataGroupCode: 'POP01' }),
        );
      });

      it('converts period to start and end dates', async () => {
        await tupaiaService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup', { period: '20200822' });
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

        await tupaiaService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup', options);
        expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(
          expect.objectContaining(options),
        );
      });

      it('directly returns the event API response', () =>
        expect(tupaiaService.pull([DATA_GROUPS.POP01_GROUP], 'dataGroup')).resolves.toStrictEqual(
          EVENTS,
        ));
    });
  });

  describe('pullMetadata()', () => {
    describe('data element', () => {
      it('single code', () =>
        expect(
          tupaiaService.pullMetadata([DATA_ELEMENTS.POP01], 'dataElement'),
        ).resolves.toStrictEqual([DATA_ELEMENT_METADATA.POP01]));

      it('multiple codes', () =>
        expect(
          tupaiaService.pullMetadata([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02], 'dataElement'),
        ).resolves.toStrictEqual([DATA_ELEMENT_METADATA.POP01, DATA_ELEMENT_METADATA.POP02]));
    });
  });
});
