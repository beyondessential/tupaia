/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaService } from '../../../services/tupaia/TupaiaService';
import { createModelsStub, createTupaiaDataApiStub } from './TupaiaService.stubs';
import {
  ANALYTICS,
  FETCH_ANALYTICS_RESULTS,
  DATA_SOURCES,
  EVENTS,
  DATA_ELEMENTS,
} from './TupaiaService.fixtures';

const models = createModelsStub();
const tupaiaDataApi = createTupaiaDataApiStub({
  fetchAnalyticsResponse: FETCH_ANALYTICS_RESULTS,
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
        const assertAnalyticsApiWasInvokedCorrectly = async ({
          dataSources,
          options = {},
          invocationArgs,
        }) => {
          await tupaiaService.pull(dataSources, 'dataElement', options);
          expect(tupaiaDataApi.fetchAnalytics).toHaveBeenCalledOnceWith(invocationArgs);
        };

        it('single data element', async () =>
          assertAnalyticsApiWasInvokedCorrectly({
            dataSources: [DATA_SOURCES.POP01],
            invocationArgs: expect.objectContaining({ dataElementCodes: ['POP01'] }),
          }));

        it('multiple data elements', async () =>
          assertAnalyticsApiWasInvokedCorrectly({
            dataSources: [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
            invocationArgs: expect.objectContaining({ dataElementCodes: ['POP01', 'POP02'] }),
          }));

        it('converts period to start and end dates', async () => {
          const optionsIn = {
            period: '20200822',
          };

          const optionsOut = {
            startDate: '2020-08-22',
            endDate: '2020-08-22',
          };

          await assertAnalyticsApiWasInvokedCorrectly({
            dataSources: [DATA_SOURCES.POP01],
            options: optionsIn,
            invocationArgs: expect.objectContaining(optionsOut),
          });
        });

        it('supports various API options', async () => {
          const options = {
            organisationUnitCodes: ['TO', 'PG'],
            startDate: '20200731',
            endDate: '20200904',
          };

          return assertAnalyticsApiWasInvokedCorrectly({
            dataSources: [DATA_SOURCES.POP01],
            options,
            invocationArgs: expect.objectContaining(options),
          });
        });
      });

      describe('data pulling', () => {
        it('returns a { results, metadata } response', async () => {
          const response = await tupaiaService.pull(
            [DATA_SOURCES.POP01, DATA_SOURCES.POP02],
            'dataElement',
          );
          expect(response).toHaveProperty('results');
          expect(response).toHaveProperty('metadata');
        });

        it('returns the analytics API response in the `results` field', () =>
          expect(
            tupaiaService.pull([DATA_SOURCES.POP01, DATA_SOURCES.POP02], 'dataElement'),
          ).resolves.toHaveProperty('results', ANALYTICS));

        it('correctly builds the `metadata` field', () =>
          expect(
            tupaiaService.pull([DATA_SOURCES.POP01, DATA_SOURCES.POP02], 'dataElement'),
          ).resolves.toHaveProperty('metadata', {
            dataElementCodeToName: {
              POP01: 'Population 1',
              POP02: 'Population 2',
            },
          }));
      });
    });

    describe('data group', () => {
      const assertEventApiWasInvokedCorrectly = async ({
        dataSources,
        options = {},
        invocationArgs,
      }) => {
        await tupaiaService.pull(dataSources, 'dataGroup', options);
        expect(tupaiaDataApi.fetchEvents).toHaveBeenCalledOnceWith(invocationArgs);
      };

      it('throws an error if multiple data groups are provided', () =>
        expect(
          tupaiaService.pull([DATA_SOURCES.POP01_GROUP, DATA_SOURCES.POP02_GROUP], 'dataGroup', {}),
        ).toBeRejectedWith(/Cannot .*multiple programs/));

      it('uses the data group code as `surveyCode`', () =>
        assertEventApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01_GROUP],
          invocationArgs: expect.objectContaining({ surveyCode: 'POP01' }),
        }));

      it('converts period to start and end dates', async () => {
        const optionsIn = {
          period: '20200822',
        };

        const optionsOut = {
          startDate: '2020-08-22',
          endDate: '2020-08-22',
        };

        await assertEventApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01_GROUP],
          options: optionsIn,
          invocationArgs: expect.objectContaining(optionsOut),
        });
      });

      it('supports various API options', async () => {
        const options = {
          dataElementCodes: ['POP01', 'POP02'],
          organisationUnitCodes: ['TO', 'PG'],
          startDate: '20200731',
          endDate: '20200904',
        };

        return assertEventApiWasInvokedCorrectly({
          dataSources: [DATA_SOURCES.POP01_GROUP],
          options,
          invocationArgs: expect.objectContaining(options),
        });
      });

      it('directly returns the event API response', () =>
        expect(tupaiaService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup')).resolves.toStrictEqual(
          EVENTS,
        ));
    });
  });

  describe('pullMetadata()', () => {
    describe('data element', () => {
      it('single code', () =>
        expect(
          tupaiaService.pullMetadata([DATA_SOURCES.POP01], 'dataElement'),
        ).resolves.toStrictEqual([DATA_ELEMENTS.POP01]));

      it('multiple codes', () =>
        expect(
          tupaiaService.pullMetadata([DATA_SOURCES.POP01, DATA_ELEMENTS.POP02], 'dataElement'),
        ).resolves.toStrictEqual([DATA_ELEMENTS.POP01, DATA_ELEMENTS.POP02]));
    });
  });
});
