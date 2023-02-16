/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, DATE_COLUMNS, PERIOD_COLUMNS } from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('orderColumns', () => {
  it('can re-order columns explicitly', async () => {
    const transform = buildTestTransform([
      {
        transform: 'orderColumns',
        order: ['dataElement', 'value', 'period', 'organisationUnit'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
      TransformTable.fromRows([
        { dataElement: 'BCD1', value: 4, period: '20200101', organisationUnit: 'TO' },
      ]),
    );
  });

  it('can re-order columns explicitly with a wildCard', async () => {
    const transform = buildTestTransform([
      {
        transform: 'orderColumns',
        order: ['dataElement', '*', 'organisationUnit'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
      TransformTable.fromRows([
        { dataElement: 'BCD1', period: '20200101', value: 4, organisationUnit: 'TO' },
      ]),
    );
  });

  it('ignores columns in the explicit order that do not exist in the table', async () => {
    const transform = buildTestTransform([
      {
        transform: 'orderColumns',
        order: ['dataElement', 'BCD1', 'period', 'value', 'organisationUnit'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
      TransformTable.fromRows([
        { dataElement: 'BCD1', period: '20200101', value: 4, organisationUnit: 'TO' },
      ]),
    );
  });

  it('defaults to appending columns to the end if they are not listed in the order', async () => {
    const transform = buildTestTransform([
      {
        transform: 'orderColumns',
        order: ['dataElement', 'organisationUnit'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
      TransformTable.fromRows([
        { dataElement: 'BCD1', organisationUnit: 'TO', period: '20200101', value: 4 },
      ]),
    );
  });

  describe('sortBy functions', () => {
    it('throws error for unknown sortBy function', () => {
      expect(() =>
        buildTestTransform([
          {
            transform: 'orderColumns',
            sortBy: 'not_a_real_sort_by_function',
          },
        ]),
      ).toThrow('sortBy must be one of the following values:');
    });

    describe('alphabetic', () => {
      it('can sort columns alphabetically', async () => {
        const transform = buildTestTransform([
          {
            transform: 'orderColumns',
            sortBy: 'alphabetic',
          },
        ]);
        expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
          TransformTable.fromRows([
            { dataElement: 'BCD1', organisationUnit: 'TO', period: '20200101', value: 4 },
          ]),
        );
      });
    });

    describe('date', () => {
      it('can sort columns by date', async () => {
        const transform = buildTestTransform([
          {
            transform: 'orderColumns',
            sortBy: 'date',
          },
        ]);
        expect(await transform(TransformTable.fromRows(DATE_COLUMNS))).toEqual(
          TransformTable.fromRows([
            {
              'Q1 2021': 4,
              '13th Jan 2022': 2,
              '2nd Aug 2022': 1,
              'Sep 2022': 3,
              organisationUnit: 'Tonga',
            },
          ]),
        );
      });
    });

    describe('period', () => {
      it('can sort columns by period', async () => {
        const transform = buildTestTransform([
          {
            transform: 'orderColumns',
            sortBy: 'period',
          },
        ]);
        expect(await transform(TransformTable.fromRows(PERIOD_COLUMNS))).toEqual(
          TransformTable.fromRows(
            [
              {
                '2021Q1': 4,
                '2022W03': 2,
                '20220802': 1,
                '202209': 3,
                organisationUnit: 'Tonga',
              },
            ],
            ['2021Q1', '2022W03', '20220802', '202209', 'organisationUnit'],
          ),
        );
      });
    });
  });
});
