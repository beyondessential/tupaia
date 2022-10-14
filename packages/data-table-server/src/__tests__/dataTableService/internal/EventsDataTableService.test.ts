/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { DataTableServiceBuilder } from '../../../dataTableService';

type Event = { eventDate: string; orgUnit: string; dataValues: Record<string, unknown> };

const TEST_EVENTS: Record<string, Event[]> = {
  PSSS_WNR: [
    {
      eventDate: '2020-01-01',
      orgUnit: 'TO',
      dataValues: { PSSS_AFR_Cases: 7, PSSS_ILI_Cases: 7 },
    },
    {
      eventDate: '2020-01-08',
      orgUnit: 'TO',
      dataValues: { PSSS_AFR_Cases: 12, PSSS_ILI_Cases: 12 },
    },
    {
      eventDate: '2020-01-15',
      orgUnit: 'FJ',
      dataValues: { PSSS_AFR_Cases: 8, PSSS_ILI_Cases: 8 },
    },
  ],
  PSSS_Confirmed_WNR: [
    {
      eventDate: '2020-01-01',
      orgUnit: 'TO',
      dataValues: { PSSS_AFR_Cases: 3, PSSS_ILI_Cases: 6 },
    },
    {
      eventDate: '2020-01-08',
      orgUnit: 'TO',
      dataValues: { PSSS_AFR_Cases: 4, PSSS_ILI_Cases: 22 },
    },
    {
      eventDate: '2020-01-15',
      orgUnit: 'FJ',
      dataValues: { PSSS_AFR_Cases: 6, PSSS_ILI_Cases: 9 },
    },
  ],
};

const fetchFakeEvents = (
  dataGroupCode: string,
  {
    dataElementCodes,
    organisationUnitCodes,
    startDate = '2020-01-01',
    endDate = '2020-12-31',
  }: {
    dataElementCodes: string[];
    organisationUnitCodes: string[];
    startDate?: string;
    endDate?: string;
  },
) => {
  const eventsForDataGroup = TEST_EVENTS[dataGroupCode];
  const eventsMatchingFilters = eventsForDataGroup.filter(
    event =>
      organisationUnitCodes.includes(event.orgUnit) &&
      event.eventDate >= startDate &&
      event.eventDate <= endDate,
  );
  const eventsWithRequestedDataElements = eventsMatchingFilters.map(
    ({ dataValues, ...restOfEvent }) => ({
      ...restOfEvent,
      dataValues: Object.fromEntries(
        Object.entries(dataValues).filter(([dataElement]) =>
          dataElementCodes.includes(dataElement),
        ),
      ),
    }),
  );
  return eventsWithRequestedDataElements;
};

const flattenEvent = ({ dataValues, ...restOfEvent }: Event) => ({ ...restOfEvent, ...dataValues });

jest.mock('@tupaia/aggregator', () => ({
  Aggregator: jest.fn().mockImplementation(() => ({
    fetchEvents: fetchFakeEvents,
  })),
}));

jest.mock('@tupaia/data-broker', () => ({
  DataBroker: jest.fn().mockImplementation(() => ({})),
}));

const accessPolicy = new AccessPolicy({ DL: ['Public'] });
const apiClient = {} as TupaiaApiClient;

describe('EventsDataTableService', () => {
  describe('parameter validation', () => {
    const testData: [string, unknown, string][] = [
      [
        'missing dataGroupCode',
        {
          hierarchy: 'psss',
          organisationUnitCodes: ['TO'],
        },
        'dataGroupCode is a required field',
      ],
      [
        'missing organisationUnitCodes',
        {
          hierarchy: 'psss',
          dataGroupCode: 'PSSS_WNR',
        },
        'organisationUnitCodes is a required field',
      ],
      [
        'missing hierarchy',
        {
          organisationUnitCodes: ['TO'],
          dataGroupCode: 'PSSS_WNR',
        },
        'hierarchy is a required field',
      ],
      [
        'startDate wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataGroupCode: 'PSSS_WNR',
          startDate: 'cat',
        },
        'startDate should be in ISO 8601 format',
      ],
      [
        'endDate wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataGroupCode: 'PSSS_WNR',
          endDate: 'dog',
        },
        'endDate should be in ISO 8601 format',
      ],
      [
        'aggregations wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataGroupCode: 'PSSS_WNR',
          aggregations: ['RAW'],
        },
        'aggregations[0] must be a `object` type',
      ],
    ];

    it.each(testData)('%s', (_, parameters: unknown, expectedError: string) => {
      const eventsDataTableService = new DataTableServiceBuilder()
        .setServiceType('events')
        .setContext({ apiClient, accessPolicy })
        .build();

      expect(() => eventsDataTableService.fetchData(parameters)).toThrow(expectedError);
    });
  });

  it('can fetch data from Aggregator.fetchEvents()', async () => {
    const eventsDataTableService = new DataTableServiceBuilder()
      .setServiceType('events')
      .setContext({ apiClient, accessPolicy })
      .build();

    const dataGroupCode = 'PSSS_WNR';
    const dataElementCodes = ['PSSS_AFR_Cases'];
    const organisationUnitCodes = ['TO'];

    const events = await eventsDataTableService.fetchData({
      hierarchy: 'psss',
      dataGroupCode,
      organisationUnitCodes,
      dataElementCodes,
    });

    const expectedEvents = fetchFakeEvents(dataGroupCode, {
      dataElementCodes,
      organisationUnitCodes,
    }).map(flattenEvent);

    expect(events).toEqual(expectedEvents);
  });

  it('passes all parameters to Aggregator.fetchEvents()', async () => {
    const eventsDataTableService = new DataTableServiceBuilder()
      .setServiceType('events')
      .setContext({ apiClient, accessPolicy })
      .build();

    const dataGroupCode = 'PSSS_Confirmed_WNR';
    const dataElementCodes = ['PSSS_AFR_Cases', 'PSSS_ILI_Cases'];
    const organisationUnitCodes = ['PG'];
    const startDate = '2020-01-05';
    const endDate = '2020-01-10';

    const events = await eventsDataTableService.fetchData({
      hierarchy: 'psss',
      organisationUnitCodes,
      dataGroupCode,
      dataElementCodes,
      startDate,
      endDate,
    });

    const expectedEvents = fetchFakeEvents(dataGroupCode, {
      dataElementCodes,
      organisationUnitCodes,
      startDate,
      endDate,
    }).map(flattenEvent);

    expect(events).toEqual(expectedEvents);
  });
});
