/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, DATE_COLUMNS, PERIOD_COLUMNS } from './transform.fixtures';
import { buildTransform, TransformTable } from '../../../reportBuilder/transform';

describe('orderColumns', () => {
  it('can re-order columns explicitly', () => {
    const transform = buildTransform([
      {
        transform: 'orderColumns',
        order: ['dataElement', 'value', 'period', 'organisationUnit'],
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
      TransformTable.fromRows([
        { dataElement: 'BCD1', value: 4, period: '20200101', organisationUnit: 'TO' },
      ]),
    );
  });

  it('can re-order columns explicitly with a wildCard', () => {
    const transform = buildTransform([
      {
        transform: 'orderColumns',
        order: ['dataElement', '*', 'organisationUnit'],
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
      TransformTable.fromRows([
        { dataElement: 'BCD1', period: '20200101', value: 4, organisationUnit: 'TO' },
      ]),
    );
  });

  it('ignores columns in the explicit order that do not exist in the table', () => {
    const transform = buildTransform([
      {
        transform: 'orderColumns',
        order: ['dataElement', 'BCD1', 'period', 'value', 'organisationUnit'],
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
      TransformTable.fromRows([
        { dataElement: 'BCD1', period: '20200101', value: 4, organisationUnit: 'TO' },
      ]),
    );
  });

  it('defaults to appending columns to the end if they are not listed in the order', () => {
    const transform = buildTransform([
      {
        transform: 'orderColumns',
        order: ['dataElement', 'organisationUnit'],
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
      TransformTable.fromRows([
        { dataElement: 'BCD1', organisationUnit: 'TO', period: '20200101', value: 4 },
      ]),
    );
  });

  describe('sortBy functions', () => {
    it('throws error for unknown sortBy function', () => {
      expect(() =>
        buildTransform([
          {
            transform: 'orderColumns',
            sortBy: 'not_a_real_sort_by_function',
          },
        ]),
      ).toThrow('sortBy must be one of the following values:');
    });

    describe('alphabetic', () => {
      it('can sort columns alphabetically', () => {
        const transform = buildTransform([
          {
            transform: 'orderColumns',
            sortBy: 'alphabetic',
          },
        ]);
        expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toEqual(
          TransformTable.fromRows([
            { dataElement: 'BCD1', organisationUnit: 'TO', period: '20200101', value: 4 },
          ]),
        );
      });
    });

    describe('date', () => {
      it('can sort columns by date', () => {
        const transform = buildTransform([
          {
            transform: 'orderColumns',
            sortBy: 'date',
          },
        ]);
        expect(transform(TransformTable.fromRows(DATE_COLUMNS))).toEqual(
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
      it('can sort columns by period', () => {
        const transform = buildTransform([
          {
            transform: 'orderColumns',
            sortBy: 'period',
          },
        ]);
        expect(transform(TransformTable.fromRows(PERIOD_COLUMNS))).toEqual(
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
