import MockDate from 'mockdate';
import { AccessPolicy } from '@tupaia/access-policy';
import { MockEntityApi, MockTupaiaApiClient } from '@tupaia/api-client';
import { DataTableServiceBuilder } from '../../../dataTableService';
import { ENTITIES, ENTITY_RELATIONS } from './fixtures';

const CURRENT_DATE_STUB = '2023-12-31';

type Event = { eventDate: string; orgUnit: string; dataValues: Record<string, unknown> };

const TEST_EVENTS: Record<string, Event[]> = {
  PSSS_WNR: [
    {
      eventDate: '2020-01-01',
      orgUnit: 'AU',
      dataValues: { PSSS_AFR_Cases: 7, PSSS_ILI_Cases: 7 },
    },
    {
      eventDate: '2020-01-08',
      orgUnit: 'PG',
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
      orgUnit: 'PG',
      dataValues: { PSSS_AFR_Cases: 3, PSSS_ILI_Cases: 6 },
    },
    {
      eventDate: '2020-01-08',
      orgUnit: 'AU',
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
    endDate = CURRENT_DATE_STUB,
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

const fetchFakeDataGroup = (dataGroupCode: string) => {
  const eventsForDataGroup = TEST_EVENTS[dataGroupCode] || [];
  const dataElements = Array.from(
    new Set(eventsForDataGroup.map(({ dataValues }) => Object.keys(dataValues)).flat()),
  ).map(dataElement => ({ code: dataElement, name: dataElement }));
  return { code: dataGroupCode, name: dataGroupCode, dataElements };
};

const flattenEvent = ({ dataValues, ...restOfEvent }: Event) => ({ ...restOfEvent, ...dataValues });

jest.mock('@tupaia/aggregator', () => ({
  Aggregator: jest.fn().mockImplementation(() => ({
    fetchEvents: fetchFakeEvents,
    fetchDataGroup: fetchFakeDataGroup,
  })),
}));

jest.mock('@tupaia/data-broker', () => ({
  DataBroker: jest.fn().mockImplementation(() => ({})),
}));

const accessPolicy = new AccessPolicy({ DL: ['Public'] });
const apiClient = new MockTupaiaApiClient({
  entity: new MockEntityApi(ENTITIES, ENTITY_RELATIONS),
});
const eventsDataTableService = new DataTableServiceBuilder()
  .setServiceType('events')
  .setContext({ apiClient, accessPolicy })
  .build();

describe('EventsDataTableService', () => {
  beforeEach(() => {
    MockDate.set(CURRENT_DATE_STUB);
  });

  afterEach(() => {
    MockDate.reset();
  });

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
        'empty dataElementCodes',
        {
          hierarchy: 'psss',
          dataGroupCode: 'PSSS_WNR',
          dataElementCodes: [],
          organisationUnitCodes: ['TO'],
        },
        'dataElementCodes field must have at least 1 items',
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
        'startDate wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataGroupCode: 'PSSS_WNR',
          startDate: 'cat',
        },
        'startDate must be a valid ISO 8601 date: YYYY-MM-DD',
      ],
      [
        'endDate wrong format',
        {
          organisationUnitCodes: ['TO'],
          hierarchy: 'psss',
          dataGroupCode: 'PSSS_WNR',
          endDate: 'dog',
        },
        'endDate must be a valid ISO 8601 date: YYYY-MM-DD',
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
      expect(() => eventsDataTableService.fetchData(parameters)).toThrow(expectedError);
    });
  });

  it('getParameters', () => {
    const parameters = eventsDataTableService.getParameters();
    expect(parameters).toEqual([
      { config: { defaultValue: 'explore', type: 'hierarchy' }, name: 'hierarchy' },
      {
        config: {
          innerType: { required: true, type: 'string' },
          required: true,
          type: 'organisationUnitCodes',
        },
        name: 'organisationUnitCodes',
      },
      {
        config: { required: true, type: 'dataGroupCode' },
        name: 'dataGroupCode',
      },
      {
        config: { innerType: { required: true, type: 'string' }, type: 'dataElementCodes' },
        name: 'dataElementCodes',
      },
      { config: { defaultValue: '2018-12-01', type: 'string' }, name: 'startDate' },
      { config: { defaultValue: '2023-12-31', type: 'string' }, name: 'endDate' },
    ]);
  });

  describe('fetchData', () => {
    it('can fetch data from Aggregator.fetchEvents()', async () => {
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

    it('maps project organisationUnits to child countries', async () => {
      const dataGroupCode = 'PSSS_Confirmed_WNR';
      const dataElementCodes = ['PSSS_AFR_Cases', 'PSSS_ILI_Cases'];

      const events = await eventsDataTableService.fetchData({
        hierarchy: 'test',
        organisationUnitCodes: ['test'],
        dataGroupCode,
        dataElementCodes,
      });

      const expectedEvents = fetchFakeEvents(dataGroupCode, {
        dataElementCodes,
        organisationUnitCodes: ['PG', 'FJ'], // PG and FJ are the countries in test
      }).map(flattenEvent);

      expect(events).toEqual(expectedEvents);
    });

    it('fetches for all dataElements in the data group if dataElementCodes not supplied', async () => {
      const dataGroupCode = 'PSSS_Confirmed_WNR';
      const organisationUnitCodes = ['PG'];

      const events = await eventsDataTableService.fetchData({
        hierarchy: 'psss',
        organisationUnitCodes,
        dataGroupCode,
      });

      const expectedEvents = fetchFakeEvents(dataGroupCode, {
        dataElementCodes: ['PSSS_AFR_Cases', 'PSSS_ILI_Cases'],
        organisationUnitCodes,
      }).map(flattenEvent);

      expect(events).toEqual(expectedEvents);
    });
  });
});
