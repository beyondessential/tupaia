/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { DhisService } from '../../../../services/dhis/DhisService';
import { DATA_SOURCES } from './DhisService.fixtures';
import { stubModels, stubDhisApi } from './helpers';

const dhisService = new DhisService(stubModels());
let dhisApi;

export const testPullEvents_Deprecated = () => {
  const basicOptions = {
    organisationUnitCode: 'TO',
  };

  beforeEach(() => {
    // recreate stub so spy calls are reset
    dhisApi = stubDhisApi();
  });

  it('throws an error if multiple data groups are provided', async () =>
    expect(
      dhisService.pull(
        [DATA_SOURCES.POP01_GROUP, DATA_SOURCES.POP02_GROUP],
        'dataGroup',
        basicOptions,
      ),
    ).to.eventually.be.rejectedWith(/Cannot .*multiple programs/));

  describe('DHIS API invocation', () => {
    const assertEventsApiWasInvokedCorrectly = async ({ dataSources, options, invocationArgs }) => {
      await dhisService.pull(dataSources, 'dataGroup', options);
      expect(dhisApi.getEvents).to.have.been.calledOnceWithExactly(invocationArgs);
    };

    it('invokes the events api in DHIS for a single data group', async () =>
      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: basicOptions,
        invocationArgs: sinon.match({ programCode: 'POP01', organisationUnitCode: 'TO' }),
      }));

    it('supports various API options', async () => {
      const apiOptions = {
        organisationUnitCode: 'TO',
        orgUnitIdScheme: 'code',
        dataElementIdScheme: 'code',
        startDate: '20200731',
        endDate: '20200904',
        eventId: '123456',
        trackedEntityInstance: '654321',
        dataValueFormat: 'object',
      };

      assertEventsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: apiOptions,
        invocationArgs: {
          programCode: 'POP01',
          ...apiOptions,
        },
      });
    });
  });

  describe('data pulling', () => {
    const assertPullResultsAreCorrect = ({
      dataSources,
      options,
      expectedResults,
      getEventsResponse,
    }) => {
      dhisApi = stubDhisApi({ getEventsResponse });
      return expect(dhisService.pull(dataSources, 'dataGroup', options)).to.eventually.deep.equal(
        expectedResults,
      );
    };

    it('basic event data group', async () => {
      const getEventsResponse = [
        {
          otherField: 'otherValue',
          dataValues: [
            { dataElement: 'POP01', value: 1 },
            { dataElement: 'POP02', value: 2 },
          ],
        },
      ];

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: basicOptions,
        getEventsResponse,
        expectedResults: getEventsResponse,
      });
    });

    it('array data values with different dhis codes', async () => {
      const getEventsResponse = [
        {
          otherField: 'otherValue',
          dataValues: [
            { dataElement: 'POP01', value: 1 },
            { dataElement: 'DIF01_DHIS', value: 3 },
          ],
        },
      ];

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.DIFF_GROUP],
        options: { ...basicOptions, dataValueFormat: 'array' },
        getEventsResponse,
        expectedResults: [
          {
            otherField: 'otherValue',
            dataValues: [
              { dataElement: 'POP01', value: 1 },
              { dataElement: 'DIF01', value: 3 },
            ],
          },
        ],
      });
    });

    it('object data values with different dhis codes', async () => {
      const getEventsResponse = [
        {
          otherField: 'otherValue',
          dataValues: {
            POP01: { dataElement: 'POP01', value: 1 },
            DIF01_DHIS: { dataElement: 'DIF01_DHIS', value: 3 },
          },
        },
      ];

      return assertPullResultsAreCorrect({
        dataSources: [DATA_SOURCES.DIFF_GROUP],
        options: { ...basicOptions, dataValueFormat: 'object' },
        getEventsResponse,
        expectedResults: [
          {
            otherField: 'otherValue',
            dataValues: {
              POP01: { dataElement: 'POP01', value: 1 },
              DIF01: { dataElement: 'DIF01', value: 3 },
            },
          },
        ],
      });
    });
  });
};
