/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { createAssertTableResults, createAssertErrorIsThrown } from './helpers';
import { DATA_VALUES } from './tableOfDataValues.fixtures';
import { tableOfDataValues } from '/apiV1/dataBuilders';

const dataValues = DATA_VALUES.filter(({ organisationUnit }) => organisationUnit === 'TO_Nukuhc');

const assertTableResults = createAssertTableResults(tableOfDataValues, dataValues);

const assertErrorIsThrown = createAssertErrorIsThrown(tableOfDataValues, dataValues);

export const testTotals = () => {
  it('table total', async () =>
    assertTableResults(
      {
        rows: ['Smokers', 'Overweight', 'Total'],
        columns: ['Female', 'Male', 'Total'],
        cells: [
          ['CD1', 'CD2'],
          ['CD3', 'CD4'],
          ['', '', '$total'],
        ],
      },
      {
        rows: [
          { dataElement: 'Smokers', Col1: 1, Col2: 2 },
          { dataElement: 'Overweight', Col1: 3, Col2: 4 },
          { dataElement: 'Total', Col1: '', Col2: '', Col3: 10 },
        ],
        columns: [
          { key: 'Col1', title: 'Female' },
          { key: 'Col2', title: 'Male' },
          { key: 'Col3', title: 'Total' },
        ],
      },
    ));

  describe('row totals', () => {
    it('1 row', async () =>
      assertTableResults(
        {
          rows: ['Smokers'],
          columns: ['Female', 'Male', 'Total'],
          cells: [['CD1', 'CD2', '$rowTotal']],
        },
        {
          rows: [{ dataElement: 'Smokers', Col1: 1, Col2: 2, Col3: 3 }],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
            { key: 'Col3', title: 'Total' },
          ],
        },
      ));

    it('2 rows', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight'],
          columns: ['Female', 'Male', 'Totals'],
          cells: [
            ['CD1', 'CD2', '$rowTotal'],
            ['CD3', 'CD4', '$rowTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: 1, Col2: 2, Col3: 3 },
            { dataElement: 'Overweight', Col1: 3, Col2: 4, Col3: 7 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
            { key: 'Col3', title: 'Totals' },
          ],
        },
      ));
  });

  describe('column totals', () => {
    it('1 column', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight', 'Total'],
          columns: ['Female'],
          cells: [['CD1'], ['CD3'], ['$columnTotal']],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: 1 },
            { dataElement: 'Overweight', Col1: 3 },
            { dataElement: 'Total', Col1: 4 },
          ],
          columns: [{ key: 'Col1', title: 'Female' }],
        },
      ));

    it('2 columns', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight', 'Totals'],
          columns: ['Female', 'Male'],
          cells: [
            ['CD1', 'CD2'],
            ['CD3', 'CD4'],
            ['$columnTotal', '$columnTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: 1, Col2: 2 },
            { dataElement: 'Overweight', Col1: 3, Col2: 4 },
            { dataElement: 'Totals', Col1: 4, Col2: 6 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
        },
      ));
  });

  describe('row and column totals', () => {
    it('1x1 non-total cells', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Total'],
          columns: ['Female', 'Total'],
          cells: [['CD1', '$rowTotal'], ['$columnTotal']],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: 1, Col2: 1 },
            { dataElement: 'Total', Col1: 1 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Total' },
          ],
        },
      ));

    it('2x2 non-total cells', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight', 'Totals'],
          columns: ['Female', 'Male', 'Totals'],
          cells: [
            ['CD1', 'CD2', '$rowTotal'],
            ['CD3', 'CD4', '$rowTotal'],
            ['$columnTotal', '$columnTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: 1, Col2: 2, Col3: 3 },
            { dataElement: 'Overweight', Col1: 3, Col2: 4, Col3: 7 },
            { dataElement: 'Totals', Col1: 4, Col2: 6 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
            { key: 'Col3', title: 'Totals' },
          ],
        },
      ));
  });

  describe('row category column totals', () => {
    it('throws error if row categories are not defined', async () =>
      assertErrorIsThrown(
        {
          rows: ['Smokers', 'Overweight', 'Totals'],
          columns: ['Female', 'Male'],
          cells: [
            ['CD1', 'CD2'],
            ['CD3', 'CD4'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal'],
          ],
        },
        'row categories are not defined',
      ));

    it('1 category', async () =>
      assertTableResults(
        {
          rows: [{ category: 'Risk Factors', rows: ['Smokers', 'Overweight', 'Totals'] }],
          columns: ['Female', 'Male'],
          cells: [
            ['CD1', 'CD2'],
            ['CD3', 'CD4'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1, Col2: 2 },
            { dataElement: 'Overweight', categoryId: 'Risk Factors', Col1: 3, Col2: 4 },
            { dataElement: 'Totals', categoryId: 'Risk Factors', Col1: 4, Col2: 6 },
            { category: 'Risk Factors' },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
        },
      ));

    it('2 categories', async () =>
      assertTableResults(
        {
          rows: [
            { category: 'Risk Factors', rows: ['Smokers', 'Overweight', 'Totals'] },
            { category: 'CVD Risk', rows: ['Green', 'Red', 'Totals'] },
          ],
          columns: ['Female', 'Male'],
          cells: [
            ['CD1', 'CD2'],
            ['CD3', 'CD4'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal'],
            ['CD5', 'CD6'],
            ['CD7', 'CD8'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1, Col2: 2 },
            { dataElement: 'Overweight', categoryId: 'Risk Factors', Col1: 3, Col2: 4 },
            { dataElement: 'Totals', categoryId: 'Risk Factors', Col1: 4, Col2: 6 },
            { dataElement: 'Green', categoryId: 'CVD Risk', Col1: 5, Col2: 6 },
            { dataElement: 'Red', categoryId: 'CVD Risk', Col1: 7, Col2: 8 },
            { dataElement: 'Totals', categoryId: 'CVD Risk', Col1: 12, Col2: 14 },
            { category: 'Risk Factors' },
            { category: 'CVD Risk' },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
        },
      ));
  });

  describe('column category row totals', () => {
    it('throws error if column categories are not defined', async () =>
      assertErrorIsThrown(
        {
          rows: ['Female', 'Male'],
          columns: ['Smokers', 'Overweight', 'Totals'],
          cells: [
            ['CD1', 'CD3', '$columnCategoryRowTotal'],
            ['CD2', 'CD4', '$columnCategoryRowTotal'],
          ],
        },
        'column categories are not defined',
      ));

    it('1 category', async () =>
      assertTableResults(
        {
          rows: ['Female', 'Male'],
          columns: [{ category: 'Risk Factors', columns: ['Smokers', 'Overweight', 'Totals'] }],
          cells: [
            ['CD1', 'CD3', '$columnCategoryRowTotal'],
            ['CD2', 'CD4', '$columnCategoryRowTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Female', Col1: 1, Col2: 3, Col3: 4 },
            { dataElement: 'Male', Col1: 2, Col2: 4, Col3: 6 },
          ],
          columns: [
            {
              category: 'Risk Factors',
              columns: [
                { key: 'Col1', title: 'Smokers' },
                { key: 'Col2', title: 'Overweight' },
                { key: 'Col3', title: 'Totals' },
              ],
            },
          ],
        },
      ));

    it('2 categories', async () =>
      assertTableResults(
        {
          rows: ['Female', 'Male'],
          columns: [
            { category: 'Risk Factors', columns: ['Smokers', 'Overweight', 'Totals'] },
            { category: 'CVD Risk', columns: ['Green', 'Red', 'Totals'] },
          ],
          cells: [
            ['CD1', 'CD3', '$columnCategoryRowTotal', 'CD5', 'CD7', '$columnCategoryRowTotal'],
            ['CD2', 'CD4', '$columnCategoryRowTotal', 'CD6', 'CD8', '$columnCategoryRowTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Female', Col1: 1, Col2: 3, Col3: 4, Col4: 5, Col5: 7, Col6: 12 },
            { dataElement: 'Male', Col1: 2, Col2: 4, Col3: 6, Col4: 6, Col5: 8, Col6: 14 },
          ],
          columns: [
            {
              category: 'Risk Factors',
              columns: [
                { key: 'Col1', title: 'Smokers' },
                { key: 'Col2', title: 'Overweight' },
                { key: 'Col3', title: 'Totals' },
              ],
            },
            {
              category: 'CVD Risk',
              columns: [
                { key: 'Col4', title: 'Green' },
                { key: 'Col5', title: 'Red' },
                { key: 'Col6', title: 'Totals' },
              ],
            },
          ],
        },
      ));
  });

  describe('row and column category totals', () => {
    it('2 row categories x 1 column category', async () =>
      assertTableResults(
        {
          rows: [
            { category: 'Risk Factors', rows: ['Smokers', 'Overweight', 'Totals'] },
            { category: 'CVD Risk', rows: ['Green', 'Red', 'Totals'] },
          ],
          columns: [{ category: 'By Gender', columns: ['Female', 'Male', 'Totals'] }],
          cells: [
            ['CD1', 'CD2', '$columnCategoryRowTotal'],
            ['CD3', 'CD4', '$columnCategoryRowTotal'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal'],
            ['CD5', 'CD6', '$columnCategoryRowTotal'],
            ['CD7', 'CD8', '$columnCategoryRowTotal'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1, Col2: 2, Col3: 3 },
            { dataElement: 'Overweight', categoryId: 'Risk Factors', Col1: 3, Col2: 4, Col3: 7 },
            { dataElement: 'Totals', categoryId: 'Risk Factors', Col1: 4, Col2: 6 },
            { dataElement: 'Green', categoryId: 'CVD Risk', Col1: 5, Col2: 6, Col3: 11 },
            { dataElement: 'Red', categoryId: 'CVD Risk', Col1: 7, Col2: 8, Col3: 15 },
            { dataElement: 'Totals', categoryId: 'CVD Risk', Col1: 12, Col2: 14 },
            { category: 'Risk Factors' },
            { category: 'CVD Risk' },
          ],
          columns: [
            {
              category: 'By Gender',
              columns: [
                { key: 'Col1', title: 'Female' },
                { key: 'Col2', title: 'Male' },
                { key: 'Col3', title: 'Totals' },
              ],
            },
          ],
        },
      ));
  });

  describe('total type combinations', () => {
    it('row, column and overall totals', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight', 'Totals'],
          columns: ['Female', 'Male', 'Totals'],
          cells: [
            ['CD1', 'CD2', '$rowTotal'],
            ['CD3', 'CD4', '$rowTotal'],
            ['$columnTotal', '$columnTotal', '$total'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: 1, Col2: 2, Col3: 3 },
            { dataElement: 'Overweight', Col1: 3, Col2: 4, Col3: 7 },
            { dataElement: 'Totals', Col1: 4, Col2: 6, Col3: 10 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
            { key: 'Col3', title: 'Totals' },
          ],
        },
      ));

    it('row category and  whole column totals ', async () =>
      assertTableResults(
        {
          rows: [
            { category: 'Risk Factors', rows: ['Smokers', 'Overweight', 'Risk Factors Totals'] },
            { category: 'CVD Risk', rows: ['Green', 'Red', 'CVD Risk Totals', 'Totals'] },
          ],
          columns: ['Female', 'Male'],
          cells: [
            ['CD1', 'CD2'],
            ['CD3', 'CD4'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal'],
            ['CD5', 'CD6'],
            ['CD7', 'CD8'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal'],
            ['$columnTotal', '$columnTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1, Col2: 2 },
            { dataElement: 'Overweight', categoryId: 'Risk Factors', Col1: 3, Col2: 4 },
            { dataElement: 'Risk Factors Totals', categoryId: 'Risk Factors', Col1: 4, Col2: 6 },
            { dataElement: 'Green', categoryId: 'CVD Risk', Col1: 5, Col2: 6 },
            { dataElement: 'Red', categoryId: 'CVD Risk', Col1: 7, Col2: 8 },
            { dataElement: 'CVD Risk Totals', categoryId: 'CVD Risk', Col1: 12, Col2: 14 },
            { dataElement: 'Totals', categoryId: 'CVD Risk', Col1: 16, Col2: 20 },
            { category: 'Risk Factors' },
            { category: 'CVD Risk' },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
        },
      ));

    it('column category and whole row totals ', async () =>
      assertTableResults(
        {
          rows: ['Female', 'Male'],
          columns: [
            { category: 'Risk Factors', columns: ['Smokers', 'Overweight', 'Risk Factors Totals'] },
            {
              category: 'CVD Risk',
              columns: ['Green', 'Red', 'CVD Risk Totals', 'Totals'],
            },
          ],
          cells: [
            [
              'CD1',
              'CD3',
              '$columnCategoryRowTotal',
              'CD5',
              'CD7',
              '$columnCategoryRowTotal',
              '$rowTotal',
            ],
            [
              'CD2',
              'CD4',
              '$columnCategoryRowTotal',
              'CD6',
              'CD8',
              '$columnCategoryRowTotal',
              '$rowTotal',
            ],
          ],
        },
        {
          rows: [
            {
              dataElement: 'Female',
              Col1: 1,
              Col2: 3,
              Col3: 4,
              Col4: 5,
              Col5: 7,
              Col6: 12,
              Col7: 16,
            },
            {
              dataElement: 'Male',
              Col1: 2,
              Col2: 4,
              Col3: 6,
              Col4: 6,
              Col5: 8,
              Col6: 14,
              Col7: 20,
            },
          ],
          columns: [
            {
              category: 'Risk Factors',
              columns: [
                { key: 'Col1', title: 'Smokers' },
                { key: 'Col2', title: 'Overweight' },
                { key: 'Col3', title: 'Risk Factors Totals' },
              ],
            },
            {
              category: 'CVD Risk',
              columns: [
                { key: 'Col4', title: 'Green' },
                { key: 'Col5', title: 'Red' },
                { key: 'Col6', title: 'CVD Risk Totals' },
                { key: 'Col7', title: 'Totals' },
              ],
            },
          ],
        },
      ));

    it('whole row category total, and row totals', async () =>
      assertTableResults(
        {
          rows: [
            {
              rows: ['Antenatal', 'Postnatal', 'Totals'],
              category: 'Clinic Visit Service Types',
            },
            {
              rows: ['Antenatal', 'Postnatal', 'Totals'],
              category: 'Home Visit Service Types',
            },
          ],
          columns: ['New Visits', 'Visits', 'Totals'],
          cells: [
            ['CD1', 'CD2', '$rowTotal'],
            ['CD3', 'CD4', '$rowTotal'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal', '$rowCategoryTotal'],
            ['CD5', 'CD6', '$rowTotal'],
            ['CD7', 'CD8', '$rowTotal'],
            ['$rowCategoryColumnTotal', '$rowCategoryColumnTotal', '$rowCategoryTotal'],
          ],
        },
        {
          rows: [
            {
              dataElement: 'Antenatal',
              categoryId: 'Clinic Visit Service Types',
              Col1: 1,
              Col2: 2,
              Col3: 3,
            },
            {
              dataElement: 'Postnatal',
              categoryId: 'Clinic Visit Service Types',
              Col1: 3,
              Col2: 4,
              Col3: 7,
            },
            {
              dataElement: 'Totals',
              categoryId: 'Clinic Visit Service Types',
              Col1: 4,
              Col2: 6,
              Col3: 10,
            },
            {
              dataElement: 'Antenatal',
              categoryId: 'Home Visit Service Types',
              Col1: 5,
              Col2: 6,
              Col3: 11,
            },
            {
              dataElement: 'Postnatal',
              categoryId: 'Home Visit Service Types',
              Col1: 7,
              Col2: 8,
              Col3: 15,
            },
            {
              dataElement: 'Totals',
              categoryId: 'Home Visit Service Types',
              Col1: 12,
              Col2: 14,
              Col3: 26,
            },
            {
              category: 'Clinic Visit Service Types',
            },
            {
              category: 'Home Visit Service Types',
            },
          ],
          columns: [
            {
              key: 'Col1',
              title: 'New Visits',
            },
            {
              key: 'Col2',
              title: 'Visits',
            },
            {
              key: 'Col3',
              title: 'Totals',
            },
          ],
        },
      ));

    it('whole column category total, and column totals', async () =>
      assertTableResults(
        {
          rows: ['Antenatal', 'Postnatal', 'Totals'],
          columns: [
            {
              columns: ['New Visits', 'Visits', 'Totals'],
              category: 'Clinic Visit Service Types',
            },
            {
              columns: ['New Visits', 'Visits', 'Totals'],
              category: 'Home Visit Service Types',
            },
          ],
          cells: [
            ['CD1', 'CD2', '$columnCategoryRowTotal', 'CD3', 'CD4', '$columnCategoryRowTotal'],
            ['CD5', 'CD6', '$columnCategoryRowTotal', 'CD7', 'CD8', '$columnCategoryRowTotal'],
            [
              '$columnTotal',
              '$columnTotal',
              '$columnCategoryTotal',
              '$columnTotal',
              '$columnTotal',
              '$columnCategoryTotal',
            ],
          ],
        },
        {
          rows: [
            {
              dataElement: 'Antenatal',
              Col1: 1,
              Col2: 2,
              Col3: 3,
              Col4: 3,
              Col5: 4,
              Col6: 7,
            },
            {
              dataElement: 'Postnatal',
              Col1: 5,
              Col2: 6,
              Col3: 11,
              Col4: 7,
              Col5: 8,
              Col6: 15,
            },
            {
              dataElement: 'Totals',
              Col1: 6,
              Col2: 8,
              Col3: 14,
              Col4: 10,
              Col5: 12,
              Col6: 22,
            },
          ],
          columns: [
            {
              columns: [
                {
                  key: 'Col1',
                  title: 'New Visits',
                },
                {
                  key: 'Col2',
                  title: 'Visits',
                },
                {
                  key: 'Col3',
                  title: 'Totals',
                },
              ],
              category: 'Clinic Visit Service Types',
            },
            {
              columns: [
                {
                  key: 'Col4',
                  title: 'New Visits',
                },
                {
                  key: 'Col5',
                  title: 'Visits',
                },
                {
                  key: 'Col6',
                  title: 'Totals',
                },
              ],
              category: 'Home Visit Service Types',
            },
          ],
        },
      ));
  });

  describe('total of missing cells', () => {
    it('row, column and overall totals, all missing', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight', 'Totals'],
          columns: ['Female', 'Male', 'Totals'],
          cells: [
            [undefined, undefined, '$rowTotal'],
            [undefined, undefined, '$rowTotal'],
            ['$columnTotal', '$columnTotal', '$total'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: '', Col2: '', Col3: 0 },
            { dataElement: 'Overweight', Col1: '', Col2: '', Col3: 0 },
            { dataElement: 'Totals', Col1: 0, Col2: 0, Col3: 0 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
            { key: 'Col3', title: 'Totals' },
          ],
        },
      ));

    it('row, column and overall totals, some missing', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight', 'Totals'],
          columns: ['Female', 'Male', 'Totals'],
          cells: [
            ['CD1', undefined, '$rowTotal'],
            [undefined, 'CD4', '$rowTotal'],
            ['$columnTotal', '$columnTotal', '$total'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: 1, Col2: '', Col3: 1 },
            { dataElement: 'Overweight', Col1: '', Col2: 4, Col3: 4 },
            { dataElement: 'Totals', Col1: 1, Col2: 4, Col3: 5 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
            { key: 'Col3', title: 'Totals' },
          ],
        },
      ));

    it('row totals, all missing', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight'],
          columns: ['Female', 'Male', 'Totals'],
          cells: [
            [undefined, undefined, '$rowTotal'],
            [undefined, undefined, '$rowTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: '', Col2: '', Col3: 0 },
            { dataElement: 'Overweight', Col1: '', Col2: '', Col3: 0 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
            { key: 'Col3', title: 'Totals' },
          ],
        },
      ));

    it('row totals, some missing', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight'],
          columns: ['Female', 'Male', 'Totals'],
          cells: [
            ['CD1', undefined, '$rowTotal'],
            [undefined, 'CD4', '$rowTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: 1, Col2: '', Col3: 1 },
            { dataElement: 'Overweight', Col1: '', Col2: 4, Col3: 4 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
            { key: 'Col3', title: 'Totals' },
          ],
        },
      ));

    it('column totals, all missing', async () =>
      assertTableResults(
        {
          rows: ['Smokers', 'Overweight', 'Totals'],
          columns: ['Female', 'Male'],
          cells: [
            [undefined, undefined],
            [undefined, undefined],
            ['$columnTotal', '$columnTotal'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', Col1: '', Col2: '' },
            { dataElement: 'Overweight', Col1: '', Col2: '' },
            { dataElement: 'Totals', Col1: 0, Col2: 0 },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
        },
      ));
  });
};
