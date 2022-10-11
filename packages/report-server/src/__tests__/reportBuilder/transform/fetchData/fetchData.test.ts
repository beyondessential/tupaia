/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import MockDate from 'mockdate';
import { EARLIEST_DATA_DATE_STRING } from '@tupaia/utils';
import { FetchReportQuery } from '../../../../types';

import { buildTestTransform } from '../../testUtils';
import {
  CURRENT_DATE_STUB,
  getFetchAnalyticsResults,
  getFetchEventsResults,
} from './fetchData.fixtures';
import { getContext } from './getContext';
import { TransformTable } from '../../../../reportBuilder/transform';

describe('fetchData', () => {
  const defaultStartDate = EARLIEST_DATA_DATE_STRING;
  const defaultEndDate = CURRENT_DATE_STUB;

  beforeAll(() => {
    MockDate.set(CURRENT_DATE_STUB);
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('can fetch analytics', async () => {
    const dataElements = ['BCD1'];
    const organisationUnits = ['TO'];
    const startDate = '2020-01-01';
    const endDate = '2020-01-02';
    const transform = buildTestTransform(
      [
        {
          transform: 'fetchData',
          parameters: {
            dataElements,
            organisationUnits,
            startDate,
            endDate,
          },
        },
      ],
      getContext(),
    );
    const received = await transform(new TransformTable());
    expect(received).toStrictEqual(
      TransformTable.fromRows(
        getFetchAnalyticsResults(dataElements, organisationUnits, startDate, endDate),
      ),
    );
  });

  it('can fetch events', async () => {
    const dataGroup = 'BCD';
    const dataElements = ['BCD1'];
    const organisationUnits = ['TO'];
    const startDate = '2020-01-01';
    const endDate = '2020-01-02';
    const transform = buildTestTransform(
      [
        {
          transform: 'fetchData',
          parameters: {
            dataGroups: [dataGroup],
            dataElements,
            organisationUnits,
            startDate,
            endDate,
          },
        },
      ],
      getContext(),
    );
    const received = await transform(new TransformTable());
    expect(received).toStrictEqual(
      TransformTable.fromRows(
        getFetchEventsResults(dataGroup, dataElements, organisationUnits, startDate, endDate),
      ),
    );
  });

  it('can use the query parameters from the original request', async () => {
    const dataElements = ['BCD1'];
    const organisationUnits = ['TO'];
    const startDate = '2020-01-01';
    const endDate = '2020-01-02';

    const transform = buildTestTransform(
      [
        {
          transform: 'fetchData',
          parameters: {
            dataElements,
          },
        },
      ],
      getContext({ startDate, endDate, organisationUnitCodes: organisationUnits }),
    );
    const received = await transform(new TransformTable());
    expect(received).toStrictEqual(
      TransformTable.fromRows(
        getFetchAnalyticsResults(dataElements, organisationUnits, startDate, endDate),
      ),
    );
  });

  describe('start and end date', () => {
    it('has default start and end dates', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = ['TO'];

      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          getFetchAnalyticsResults(
            dataElements,
            organisationUnits,
            defaultStartDate,
            defaultEndDate,
          ),
        ),
      );
    });

    it('transform dates take precedence over query dates', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = ['TO'];
      const queryStartDate = EARLIEST_DATA_DATE_STRING;
      const queryEndDate = CURRENT_DATE_STUB;
      const transformStartDate = '2020-01-01';
      const transformEndDate = '2020-01-02';

      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
              startDate: transformStartDate,
              endDate: transformEndDate,
            },
          },
        ],
        getContext({ startDate: queryStartDate, endDate: queryEndDate }),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          getFetchAnalyticsResults(
            dataElements,
            organisationUnits,
            transformStartDate,
            transformEndDate,
          ),
        ),
      );
    });

    it('can use start and endDate in table using @all', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = ['TO'];
      const startDate = '= min(@all.date)';
      const endDate = '= max(@all.date)';
      const rows = [{ date: '2018-01-01' }, { date: '2020-02-03' }];
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
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
          ...getFetchAnalyticsResults(dataElements, organisationUnits, '2018-01-01', '2020-02-03'),
        ]),
      );
    });

    describe('date specs', () => {
      it('can apply modifiers to dates', async () => {
        const dataElements = ['BCD1'];
        const organisationUnits = ['TO'];

        const transform = buildTestTransform(
          [
            {
              transform: 'fetchData',
              parameters: {
                dataElements,
                organisationUnits,
                startDate: { unit: 'year', offset: '-2' },
                endDate: { unit: 'month', offset: '3' },
              },
            },
          ],
          getContext({ startDate: '2020-01-01', endDate: '2020-01-02' }),
        );
        const received = await transform(new TransformTable());
        expect(received).toStrictEqual(
          TransformTable.fromRows(
            getFetchAnalyticsResults(dataElements, organisationUnits, '2018-01-01', '2020-04-02'),
          ),
        );
      });

      it('can apply complex modifiers to dates', async () => {
        const dataElements = ['BCD1'];
        const organisationUnits = ['TO'];

        const transform = buildTestTransform(
          [
            {
              transform: 'fetchData',
              parameters: {
                dataElements,
                organisationUnits,
                startDate: {
                  unit: 'year',
                  offset: '-2',
                  modifier: 'start_of',
                  modifierUnit: 'year',
                },
                endDate: {
                  unit: 'year',
                  offset: '-1',
                  modifier: 'end_of',
                  modifierUnit: 'year',
                },
              },
            },
          ],
          getContext({ startDate: '2019-05-06', endDate: '2020-10-01' }),
        );
        const received = await transform(new TransformTable());
        expect(received).toStrictEqual(
          TransformTable.fromRows(
            getFetchAnalyticsResults(dataElements, organisationUnits, '2017-01-01', '2019-12-31'),
          ),
        );
      });

      it('can adjust the date to modify from', async () => {
        const dataElements = ['BCD1'];
        const organisationUnits = ['TO'];

        const transform = buildTestTransform(
          [
            {
              transform: 'fetchData',
              parameters: {
                dataElements,
                organisationUnits,
                startDate: {
                  from: 'today',
                  unit: 'day',
                  offset: '-1',
                },
                endDate: {
                  unit: 'day',
                  offset: '-1',
                },
              },
            },
          ],
          getContext(),
        );
        const received = await transform(new TransformTable());
        expect(received).toStrictEqual(
          TransformTable.fromRows(
            getFetchAnalyticsResults(dataElements, organisationUnits, '2020-12-14', '2020-12-14'),
          ),
        );
      });
    });
  });

  describe('organisationUnits', () => {
    describe('error cases', () => {
      type TestParams = [
        string,
        { config?: Record<string, unknown>; query?: Partial<FetchReportQuery> },
        string,
      ];
      const testData: TestParams[] = [
        [
          'throws error if no organisation units requested',
          {
            query: { organisationUnitCodes: [] },
          },
          "Must provide 'organisationUnitCodes' URL parameter, or 'organisationUnits' in fetch config",
        ],
        [
          'throws error if no organisation units found with requested codes',
          {
            query: { organisationUnitCodes: ['fake_code'] },
          },
          'No entities found with codes: fake_code',
        ],
        [
          'throws error if no organisation units found with config codes',
          {
            config: { organisationUnits: ['fake_code', 'faker_code'] },
          },
          'No entities found with codes: fake_code,faker_code',
        ],
        [
          'throws error if no organisation units with permission for requested codes',
          {
            query: { organisationUnitCodes: ['KI'] },
          },
          "No 'Admin' access to any one of entities: KI",
        ],
        [
          'throws error if user does not have access to a country within a project',
          {
            config: { hierarchy: 'underwater_world', organisationUnits: ['underwater_world'] },
          },
          "No 'Admin' access to any one of entities: underwater_world",
        ],
      ];

      it.each(testData)('%s', async (_, { config, query }, expectedError) => {
        const dataElements = ['BCD1'];

        const transform = buildTestTransform(
          [
            {
              transform: 'fetchData',
              parameters: {
                dataElements,
                ...config,
              },
            },
          ],
          getContext(query),
        );
        await expect(transform(new TransformTable())).rejects.toThrow(expectedError);
      });
    });

    it('can fetch an array of organisationUnits', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = ['TO', 'PG'];
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          getFetchAnalyticsResults(
            dataElements,
            organisationUnits,
            defaultStartDate,
            defaultEndDate,
          ),
        ),
      );
    });

    it('can filters out organisationUnits without access', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = ['TO', 'KI'];
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          getFetchAnalyticsResults(dataElements, ['TO'], defaultStartDate, defaultEndDate),
        ),
      );
    });

    it('fetches for countries the user can access if project is used', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = ['explore'];
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          getFetchAnalyticsResults(
            dataElements,
            ['TO', 'WS', 'PG'],
            defaultStartDate,
            defaultEndDate,
          ),
        ),
      );
    });

    it('can combine with the requested organisationUnits using @params.organisationUnitsCodes', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = "= concat(@params.organisationUnitCodes, ['PG'])";
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
            },
          },
        ],
        getContext({ organisationUnitCodes: ['TO'] }),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          getFetchAnalyticsResults(dataElements, ['TO', 'PG'], defaultStartDate, defaultEndDate),
        ),
      );
    });

    it('can use organisationUnits in table using @all', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = '= @all.organisationUnits';
      const rows = [{ organisationUnits: 'TO' }, { organisationUnits: 'PG' }];
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
            },
          },
        ],
        getContext(),
      );
      const received = await transform(TransformTable.fromRows(rows));
      expect(received).toStrictEqual(
        TransformTable.fromRows([
          ...rows,
          ...getFetchAnalyticsResults(dataElements, ['TO', 'PG'], defaultStartDate, defaultEndDate),
        ]),
      );
    });

    it('fetches for countries the user can access if project is request organisation unit', async () => {
      const dataElements = ['BCD1'];
      const organisationUnits = "= concat(@params.organisationUnitCodes, ['PG_Facility'])";
      const transform = buildTestTransform(
        [
          {
            transform: 'fetchData',
            parameters: {
              dataElements,
              organisationUnits,
            },
          },
        ],
        getContext({ organisationUnitCodes: ['explore'] }),
      );
      const received = await transform(new TransformTable());
      expect(received).toStrictEqual(
        TransformTable.fromRows(
          getFetchAnalyticsResults(
            dataElements,
            ['TO', 'WS', 'PG', 'PG_Facility'],
            defaultStartDate,
            defaultEndDate,
          ),
        ),
      );
    });
  });
});
