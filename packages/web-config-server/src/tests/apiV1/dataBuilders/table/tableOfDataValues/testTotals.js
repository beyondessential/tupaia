/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { createAssertTableResults, createAssertErrorIsThrown } from './helpers';
import { DATA_VALUES } from './tableOfDataValues.fixtures';

const dataValues = DATA_VALUES.filter(({ organisationUnit }) => organisationUnit === 'TO_Nukuhc');

const assertTableResults = createAssertTableResults(dataValues);

const assertErrorIsThrown = createAssertErrorIsThrown(dataValues);

export const testTotals = () => {
  it('table total', () =>
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
    it('1 row', () =>
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

    it('2 rows', () =>
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
    it('1 column', () =>
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

    it('2 columns', () =>
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
    it('1x1 non-total cells', () =>
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

    it('2x2 non-total cells', () =>
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
    it('throws error if row categories are not defined', () =>
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

    it('1 category', () =>
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
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
          categories: [{ key: 'Risk Factors', title: 'Risk Factors' }],
        },
      ));

    it('2 categories', () =>
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
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
          categories: [
            { key: 'Risk Factors', title: 'Risk Factors' },
            { key: 'CVD Risk', title: 'CVD Risk' },
          ],
        },
      ));
  });

  describe('column category row totals', () => {
    it('throws error if column categories are not defined', () =>
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

    it('1 category', () =>
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

    it('2 categories', () =>
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
    it('2 row categories x 1 column category', () =>
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
          categories: [
            { key: 'Risk Factors', title: 'Risk Factors' },
            { key: 'CVD Risk', title: 'CVD Risk' },
          ],
        },
      ));
  });

  describe('total type combinations', () => {
    it('row, column and overall totals', () =>
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

    it('row category and  whole column totals ', () =>
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
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
          categories: [
            { key: 'Risk Factors', title: 'Risk Factors' },
            { key: 'CVD Risk', title: 'CVD Risk' },
          ],
        },
      ));

    it('column category and whole row totals ', () =>
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
  });
};
