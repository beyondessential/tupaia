/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import * as BuildEvents from '../../../../../services/dhis/buildAnalytics/buildEventsFromDhisEventAnalytics';
import { DhisService } from '../../../../../services/dhis/DhisService';
import { DATA_SOURCES } from '../DhisService.fixtures';
import { createModelsStub, stubDhisApi } from '../DhisService.stubs';

const dhisService = new DhisService(createModelsStub());
let dhisApi;

export const testPullEvents = () => {
  beforeEach(() => {
    dhisApi = stubDhisApi();
  });

  it('throws an error if multiple data groups are provided', async () =>
    expect(
      dhisService.pull([DATA_SOURCES.POP01_GROUP, DATA_SOURCES.DIFF_GROUP], 'dataGroup', {}),
    ).to.be.rejectedWith(/Cannot .*multiple programs/));

  it('invokes the deprecated event api by default', async () => {
    const eventApiSpy = sinon.spy(dhisService, 'pullEventsForApi');
    const deprecatedEventApiSpy = sinon.spy(dhisService, 'pullEventsForApi_Deprecated');

    await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {});
    expect(eventApiSpy).to.have.callCount(0);
    expect(deprecatedEventApiSpy).to.have.callCount(1);
  });

  describe('DHIS API invocation', () => {
    const assertEventAnalyticsApiWasInvokedCorrectly = async ({
      dataSources,
      options = {},
      invocationArgs,
    }) => {
      await dhisService.pull(dataSources, 'dataGroup', {
        ...options,
        useDeprecatedApi: false,
      });
      expect(dhisApi.getEventAnalytics).to.have.been.calledOnceWithExactly(invocationArgs);
    };

    it('correctly invokes the event analytics api in DHIS', () =>
      assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        invocationArgs: sinon.match({ programCode: 'POP01' }),
      }));

    it('forces `dataElementIdScheme` option to `code`', async () =>
      assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: { dataElementIdScheme: 'id' },
        invocationArgs: sinon.match({ dataElementIdScheme: 'code' }),
      }));

    it('`dataElementCodes` can be empty', async () => {
      const assertErrorIsNotThrown = async dataElementCodes =>
        expect(
          dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {
            dataElementCodes,
            useDeprecatedApi: false,
          }),
        ).to.not.be.rejected;

      return Promise.all([undefined, []].map(assertErrorIsNotThrown));
    });

    it('supports various API options', async () => {
      const options = {
        dataElementCodes: ['POP01', 'POP02'],
        period: '20200427',
        startDate: '20200731',
        endDate: '20200904',
      };

      return assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options,
        invocationArgs: sinon.match(options),
      });
    });

    it('translates data source element to DHIS element codes if required', () =>
      assertEventAnalyticsApiWasInvokedCorrectly({
        dataSources: [DATA_SOURCES.POP01_GROUP],
        options: { dataElementCodes: ['POP01', 'DIF01'] },
        invocationArgs: sinon.match({ dataElementCodes: ['POP01', 'DIF01_DHIS'] }),
      }));
  });

  describe('data building', () => {
    const basicOptions = {
      useDeprecatedApi: false,
    };
    let buildEventsStub;

    before(() => {
      buildEventsStub = sinon.stub(BuildEvents, 'buildEventsFromDhisEventAnalytics');
    });

    beforeEach(() => {
      buildEventsStub.returns([]);
      buildEventsStub.resetHistory();
    });

    after(() => {
      buildEventsStub.restore();
    });

    describe('buildEventsFromDhisEventAnalytics() invocation', () => {
      it('simple data elements', async () => {
        const getEventAnalyticsResponse = {
          headers: [
            { name: 'POP01', column: 'Population 1', valueType: 'NUMBER' },
            { name: 'POP02', column: 'Population 2', valueType: 'NUMBER' },
          ],
          metaData: {
            items: {
              POP01: { name: 'Population 1' },
              POP02: { name: 'Population 2' },
            },
            dimensions: { POP01: [], POP02: [] },
          },
          rows: [],
        };
        dhisApi = stubDhisApi({ getEventAnalyticsResponse });
        const dataElementCodes = ['POP01', 'POP02'];

        await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {
          ...basicOptions,
          dataElementCodes,
        });
        expect(BuildEvents.buildEventsFromDhisEventAnalytics).to.have.been.calledOnceWithExactly(
          getEventAnalyticsResponse,
          dataElementCodes,
        );
      });

      it('data elements with data source codes different than DHIS2 codes', async () => {
        const getEventAnalyticsResponse = {
          headers: [{ name: 'DIF01_DHIS', column: 'Different 1', valueType: 'NUMBER' }],
          metaData: {
            items: {
              DIF01_DHIS: { name: 'Different 1' },
            },
            dimensions: {
              DIF01_DHIS: [],
            },
          },
          rows: [],
        };
        const translatedEventAnalyticsResponse = {
          headers: [{ name: 'DIF01', column: 'Different 1', valueType: 'NUMBER' }],
          metaData: {
            items: {
              DIF01: { name: 'Different 1' },
            },
            dimensions: { DIF01: [] },
          },
          rows: [],
        };
        dhisApi = stubDhisApi({ getEventAnalyticsResponse });

        const dataElementCodes = ['DIF01'];
        await dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', {
          ...basicOptions,
          dataElementCodes,
        });
        expect(BuildEvents.buildEventsFromDhisEventAnalytics).to.have.been.calledOnceWith(
          translatedEventAnalyticsResponse,
          dataElementCodes,
        );
      });
    });

    it('directly returns the buildEventsFromDhisEventAnalytics() results', () => {
      const events = [
        {
          event: 'event1_dhisId',
          eventDate: '2020-02-06T10:18:00.000',
          orgUnit: 'TO_Nukuhc',
          orgUnitName: 'Nukunuku',
          dataValues: {
            POP01: 1,
            POP02: 2,
          },
        },
      ];
      buildEventsStub.returns(events);

      return expect(
        dhisService.pull([DATA_SOURCES.POP01_GROUP], 'dataGroup', basicOptions),
      ).to.eventually.deep.equal(events);
    });
  });
};
