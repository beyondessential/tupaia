import MockDate from 'mockdate';
import { EARLIEST_DATA_DATE_STRING } from '@tupaia/utils';
import { buildTestTransform } from '../../testUtils';
import { TransformTable } from '../../../../reportBuilder/transform';
import { CURRENT_DATE_STUB, eventsDataTable } from '../../../fixtures';
import { getContext } from './getContext';
import { analyticsDataTable } from './fixtures';

describe('fetchData', () => {
  const defaultStartDate = EARLIEST_DATA_DATE_STRING;
  const defaultEndDate = CURRENT_DATE_STUB;

  beforeAll(() => {
    MockDate.set(CURRENT_DATE_STUB);
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('can fetch from the analytics data-table', async () => {
    const parameters = {
      dataElementCodes: ['BCD1'],
      organisationUnitCodes: ['TO'],
      startDate: '2020-01-01',
      endDate: '2020-01-02',
    };
    const transform = buildTestTransform(
      [
        {
          transform: 'fetchData',
          dataTableCode: 'analytics',
          parameters,
        },
      ],
      getContext(),
    );
    const received = await transform(new TransformTable());
    expect(received).toStrictEqual(
      TransformTable.fromRows(analyticsDataTable.fetchData(parameters)),
    );
  });

  it('can fetch from the events data-table', async () => {
    const parameters = {
      dataGroupCode: 'BCD',
      dataElementCodes: ['BCD1'],
      organisationUnitCodes: ['TO'],
      startDate: '2020-01-01',
      endDate: '2020-01-02',
    };
    const transform = buildTestTransform(
      [
        {
          transform: 'fetchData',
          dataTableCode: 'events',
          parameters,
        },
      ],
      getContext(),
    );
    const received = await transform(new TransformTable());
    expect(received).toStrictEqual(TransformTable.fromRows(eventsDataTable.fetchData(parameters)));
  });

  it('can use the query parameters from the original request', async () => {
    const parameters = {
      dataElementCodes: ['BCD1'],
      organisationUnitCodes: ['TO'],
      startDate: '2020-01-01',
      endDate: '2020-01-02',
    };

    const transform = buildTestTransform(
      [
        {
          transform: 'fetchData',
          dataTableCode: 'analytics',
          parameters,
        },
      ],
      getContext({
        startDate: parameters.startDate,
        endDate: parameters.endDate,
        organisationUnitCodes: parameters.organisationUnitCodes,
      }),
    );
    const received = await transform(new TransformTable());
    expect(received).toStrictEqual(
      TransformTable.fromRows(analyticsDataTable.fetchData(parameters)),
    );
  });

  describe('join', () => {
    it('can join new data to the existing table', async () => {
      const parameters = {
        dataElementCodes: ['BCD1'],
        organisationUnitCodes: ['TO'],
        startDate: '2017-01-01',
        endDate: '2022-01-02',
      };
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            dataTableCode: 'analytics',
            parameters,
            join: [
              {
                tableColumn: 'entity',
                newDataColumn: 'organisationUnit',
              },
            ],
          },
        ],
        getContext(),
      );

      const fetchedAnalytics = analyticsDataTable.fetchData(parameters);

      const existingTable = [
        {
          entity: 'TO',
        },
      ];

      const resultTable = fetchedAnalytics.map(analytic => ({ ...existingTable[0], ...analytic }));

      const received = await transform(TransformTable.fromRows(existingTable));
      expect(received).toStrictEqual(TransformTable.fromRows(resultTable));
    });

    it('can join on multiple fields', async () => {
      const parameters = {
        dataElementCodes: ['BCD1', 'BCD2'],
        organisationUnitCodes: ['TO', 'PG'],
        startDate: '2017-01-01',
        endDate: '2022-01-02',
      };
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            dataTableCode: 'analytics',
            parameters,
            join: [
              {
                tableColumn: 'entity',
                newDataColumn: 'organisationUnit',
              },
              {
                tableColumn: 'question_code',
                newDataColumn: 'dataElement',
              },
            ],
          },
        ],
        getContext(),
      );

      const fetchedAnalytics = analyticsDataTable.fetchData(parameters);

      const existingTable = [
        {
          question_code: 'BCD1',
          entity: 'TO',
        },
        {
          question_code: 'BCD2',
          entity: 'PG',
        },
      ];

      const resultTable = existingTable
        .flatMap(row => {
          const matchingAnalytics = fetchedAnalytics.filter(
            analytic =>
              analytic.dataElement === row.question_code &&
              analytic.organisationUnit === row.entity,
          );

          if (!matchingAnalytics) {
            return row;
          }

          return matchingAnalytics.map(analytic => ({ ...row, ...analytic }));
        });

      const received = await transform(TransformTable.fromRows(existingTable));
      expect(received).toStrictEqual(TransformTable.fromRows(resultTable));
    });
  });

  describe('start and end date', () => {
    it('has default start and end dates', async () => {
      const dataElementCodes = ['BCD1'];
      const organisationUnitCodes = ['TO'];

      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            dataTableCode: 'analytics',
            parameters: {
              dataElementCodes,
              organisationUnitCodes,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          analyticsDataTable.fetchData({
            dataElementCodes,
            organisationUnitCodes,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
        ),
      );
    });

    it('transform dates take precedence over query dates', async () => {
      const queryStartDate = EARLIEST_DATA_DATE_STRING;
      const queryEndDate = CURRENT_DATE_STUB;
      const parameters = {
        dataElementCodes: ['BCD1'],
        organisationUnitCodes: ['TO'],
        startDate: '2020-01-01', // transform result
        endDate: '2020-01-02', // transform result
      };

      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            dataTableCode: 'analytics',
            parameters,
          },
        ],
        getContext({ startDate: queryStartDate, endDate: queryEndDate }),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(analyticsDataTable.fetchData(parameters)),
      );
    });

    it('can use start and endDate in table using @all', async () => {
      const dataElementCodes = ['BCD1'];
      const organisationUnitCodes = ['TO'];
      const startDate = '= min(@all.date)';
      const endDate = '= max(@all.date)';
      const rows = [{ date: '2018-01-01' }, { date: '2020-02-03' }];
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            dataTableCode: 'analytics',
            parameters: {
              dataElementCodes,
              organisationUnitCodes,
              startDate,
              endDate,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(TransformTable.fromRows(rows));
      expect(received).toStrictEqual(
        TransformTable.fromRows([
          ...rows,
          ...analyticsDataTable.fetchData({
            dataElementCodes,
            organisationUnitCodes,
            startDate: '2018-01-01',
            endDate: '2020-02-03',
          }),
        ]),
      );
    });
  });

  describe('organisationUnits', () => {
    it('can fetch an array of organisationUnits', async () => {
      const dataElementCodes = ['BCD1'];
      const organisationUnitCodes = ['TO', 'PG'];
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            dataTableCode: 'analytics',
            parameters: {
              dataElementCodes,
              organisationUnitCodes,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          analyticsDataTable.fetchData({
            dataElementCodes,
            organisationUnitCodes,
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
        ),
      );
    });

    it('can combine with the requested organisationUnits using @params.organisationUnitsCodes', async () => {
      const dataElementCodes = ['BCD1'];
      const organisationUnitCodes = "= concat(@params.organisationUnitCodes, ['PG'])";
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            dataTableCode: 'analytics',
            parameters: {
              dataElementCodes,
              organisationUnitCodes,
            },
          },
        ],
        getContext({ organisationUnitCodes: ['TO'] }),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          analyticsDataTable.fetchData({
            dataElementCodes,
            organisationUnitCodes: ['TO', 'PG'],
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
        ),
      );
    });

    it('can use organisationUnits in table using @all', async () => {
      const dataElementCodes = ['BCD1'];
      const organisationUnitCodes = '= @all.organisationUnits';
      const rows = [{ organisationUnits: 'TO' }, { organisationUnits: 'PG' }];
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            dataTableCode: 'analytics',
            parameters: {
              dataElementCodes,
              organisationUnitCodes,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(TransformTable.fromRows(rows));
      expect(received).toStrictEqual(
        TransformTable.fromRows([
          ...rows,
          ...analyticsDataTable.fetchData({
            dataElementCodes,
            organisationUnitCodes: ['TO', 'PG'],
            startDate: defaultStartDate,
            endDate: defaultEndDate,
          }),
        ]),
      );
    });
  });
});
