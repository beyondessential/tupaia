/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { createAssertTableResults } from './helpers';
import { DATA_VALUES } from './tableOfDataValues.fixtures';
import { tableOfDataValues } from '/apiV1/dataBuilders';

const assertTableResults = createAssertTableResults(
  tableOfDataValues,
  DATA_VALUES.filter(({ organisationUnit }) => organisationUnit === 'TO_Nukuhc'),
);

export const testCategories = () => {
  describe('row categories', () => {
    it('1 category x 1 row', async () =>
      assertTableResults(
        {
          rows: [{ category: 'Risk Factors', rows: ['Smokers'] }],
          columns: ['Female'],
          cells: [['CD1']],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1 },
            { category: 'Risk Factors' },
          ],
          columns: [{ key: 'Col1', title: 'Female' }],
        },
      ));

    it('1 category x 2 rows', async () =>
      assertTableResults(
        {
          rows: [{ category: 'Risk Factors', rows: ['Smokers', 'Overweight'] }],
          columns: ['Female'],
          cells: [['CD1'], ['CD3']],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1 },
            { dataElement: 'Overweight', categoryId: 'Risk Factors', Col1: 3 },
            { category: 'Risk Factors' },
          ],
          columns: [{ key: 'Col1', title: 'Female' }],
        },
      ));

    it('2 categories x 1 row', async () =>
      assertTableResults(
        {
          rows: [
            { category: 'Risk Factors', rows: ['Smokers'] },
            { category: 'CVD Risk', rows: ['Green'] },
          ],
          columns: ['Female'],
          cells: [['CD1'], ['CD5']],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1 },
            { dataElement: 'Green', categoryId: 'CVD Risk', Col1: 5 },
            { category: 'Risk Factors' },
            { category: 'CVD Risk' },
          ],
          columns: [{ key: 'Col1', title: 'Female' }],
        },
      ));

    it('2 categories x 2 rows', async () =>
      assertTableResults(
        {
          rows: [
            { category: 'Risk Factors', rows: ['Smokers', 'Overweight'] },
            { category: 'CVD Risk', rows: ['Green', 'Red'] },
          ],
          columns: ['Female'],
          cells: [['CD1'], ['CD3'], ['CD5'], ['CD7']],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1 },
            { dataElement: 'Overweight', categoryId: 'Risk Factors', Col1: 3 },
            { dataElement: 'Green', categoryId: 'CVD Risk', Col1: 5 },
            { dataElement: 'Red', categoryId: 'CVD Risk', Col1: 7 },
            { category: 'Risk Factors' },
            { category: 'CVD Risk' },
          ],
          columns: [{ key: 'Col1', title: 'Female' }],
        },
      ));

    it('rows with same title in the same categories', async () =>
      assertTableResults(
        {
          rows: [{ category: 'Risk Factors', rows: ['Female', 'Female'] }],
          columns: ['Count'],
          cells: [['CD1'], ['CD3']],
        },
        {
          rows: [
            { dataElement: 'Female', categoryId: 'Risk Factors', Col1: 1 },
            { dataElement: 'Female', categoryId: 'Risk Factors', Col1: 3 },
            { category: 'Risk Factors' },
          ],
          columns: [{ key: 'Col1', title: 'Count' }],
        },
      ));

    it('rows with same title in different categories', async () =>
      assertTableResults(
        {
          rows: [
            { category: 'Female', rows: ['Smokers'] },
            { category: 'Male', rows: ['Smokers'] },
          ],
          columns: ['Count'],
          cells: [['CD1'], ['CD2']],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Female', Col1: 1 },
            { dataElement: 'Smokers', categoryId: 'Male', Col1: 2 },
            { category: 'Female' },
            { category: 'Male' },
          ],
          columns: [{ key: 'Col1', title: 'Count' }],
        },
      ));

    it('should fetch rows from data', async () =>
      assertTableResults(
        {
          rows: [
            {
              category: 'Risk Factors',
              rows: [
                {
                  code: 'CD1',
                  name: 'Smokers',
                },
                {
                  code: 'DoesntExist',
                  name: 'This should not be added to rows',
                },
              ],
            },
          ],
          columns: ['Female'],
          cells: [['CD1']],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1 },
            { category: 'Risk Factors' },
          ],
          columns: [{ key: 'Col1', title: 'Female' }],
        },
      ));

    it('should fetch rowInfo from data', async () =>
      assertTableResults(
        {
          rows: [
            {
              category: 'Risk Factors',
              rows: [
                {
                  code: 'CD1',
                  name: 'Smokers',
                  descriptionDataElement: 'CD_Description',
                },
              ],
            },
          ],
          columns: ['Female'],
          cells: [['CD1']],
        },
        {
          rows: [
            {
              dataElement: 'Smokers',
              categoryId: 'Risk Factors',
              Col1: 1,
              rowInfo: 'Communicable diseases description',
            },
            { category: 'Risk Factors' },
          ],
          columns: [{ key: 'Col1', title: 'Female' }],
        },
      ));
  });

  describe('column categories', () => {
    it('1 category x 1 column', async () =>
      assertTableResults(
        {
          rows: ['Female'],
          columns: [{ category: 'Risk Factors', columns: ['Smokers'] }],
          cells: [['CD1']],
        },
        {
          rows: [{ dataElement: 'Female', Col1: 1 }],
          columns: [
            {
              category: 'Risk Factors',
              columns: [{ key: 'Col1', title: 'Smokers' }],
            },
          ],
        },
      ));

    it('1 category x 2 columns', async () =>
      assertTableResults(
        {
          rows: ['Female'],
          columns: [{ category: 'Risk Factors', columns: ['Smokers', 'Overweight'] }],
          cells: [['CD1', 'CD2']],
        },
        {
          rows: [{ dataElement: 'Female', Col1: 1, Col2: 2 }],
          columns: [
            {
              category: 'Risk Factors',
              columns: [
                { key: 'Col1', title: 'Smokers' },
                { key: 'Col2', title: 'Overweight' },
              ],
            },
          ],
        },
      ));

    it('2 categories x 1 column', async () =>
      assertTableResults(
        {
          rows: ['Female'],
          columns: [
            { category: 'Risk Factors', columns: ['Smokers'] },
            { category: 'CVD Risk', columns: ['Green'] },
          ],
          cells: [['CD1', 'CD5']],
        },
        {
          rows: [{ dataElement: 'Female', Col1: 1, Col2: 5 }],
          columns: [
            {
              category: 'Risk Factors',
              columns: [{ key: 'Col1', title: 'Smokers' }],
            },
            {
              category: 'CVD Risk',
              columns: [{ key: 'Col2', title: 'Green' }],
            },
          ],
        },
      ));

    it('2 categories x 2 columns', async () =>
      assertTableResults(
        {
          rows: ['Female'],
          columns: [
            { category: 'Risk Factors', columns: ['Smokers', 'Overweight'] },
            { category: 'CVD Risk', columns: ['Green', 'Red'] },
          ],
          cells: [['CD1', 'CD3', 'CD5', 'CD7']],
        },
        {
          rows: [{ dataElement: 'Female', Col1: 1, Col2: 3, Col3: 5, Col4: 7 }],
          columns: [
            {
              category: 'Risk Factors',
              columns: [
                { key: 'Col1', title: 'Smokers' },
                { key: 'Col2', title: 'Overweight' },
              ],
            },
            {
              category: 'CVD Risk',
              columns: [
                { key: 'Col3', title: 'Green' },
                { key: 'Col4', title: 'Red' },
              ],
            },
          ],
        },
      ));

    it('columns with same title in the same categories', async () =>
      assertTableResults(
        {
          rows: ['Count'],
          columns: [{ category: 'Risk Factors', columns: ['Female', 'Female'] }],
          cells: [['CD1', 'CD3']],
        },
        {
          rows: [{ dataElement: 'Count', Col1: 1, Col2: 3 }],
          columns: [
            {
              category: 'Risk Factors',
              columns: [
                { key: 'Col1', title: 'Female' },
                { key: 'Col2', title: 'Female' },
              ],
            },
          ],
        },
      ));

    it('columns with same title in different categories', async () =>
      assertTableResults(
        {
          rows: ['Count'],
          columns: [
            { category: 'Risk Factors', columns: ['Female'] },
            { category: 'CVD Risk', columns: ['Female'] },
          ],
          cells: [['CD1', 'CD5']],
        },
        {
          rows: [{ dataElement: 'Count', Col1: 1, Col2: 5 }],
          columns: [
            {
              category: 'Risk Factors',
              columns: [{ key: 'Col1', title: 'Female' }],
            },
            {
              category: 'CVD Risk',
              columns: [{ key: 'Col2', title: 'Female' }],
            },
          ],
        },
      ));
  });

  describe('row and column categories', () => {
    it('1 category x 1 row, 1 category x 1 column', async () =>
      assertTableResults(
        {
          rows: [{ category: 'Risk Factors', rows: ['Smokers'] }],
          columns: [{ category: 'By Gender', columns: ['Female'] }],
          cells: [['CD1']],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1 },
            { category: 'Risk Factors' },
          ],
          columns: [
            {
              category: 'By Gender',
              columns: [{ key: 'Col1', title: 'Female' }],
            },
          ],
        },
      ));

    it('2 categories x 2 rows, 1 category x 2 columns, ', async () =>
      assertTableResults(
        {
          rows: [
            { category: 'Risk Factors', rows: ['Smokers', 'Overweight'] },
            { category: 'CVD Risk', rows: ['Green', 'Red'] },
          ],
          columns: [{ category: 'By Gender', columns: ['Female', 'Male'] }],
          cells: [
            ['CD1', 'CD2'],
            ['CD3', 'CD4'],
            ['CD5', 'CD6'],
            ['CD7', 'CD8'],
          ],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'Risk Factors', Col1: 1, Col2: 2 },
            { dataElement: 'Overweight', categoryId: 'Risk Factors', Col1: 3, Col2: 4 },
            { dataElement: 'Green', categoryId: 'CVD Risk', Col1: 5, Col2: 6 },
            { dataElement: 'Red', categoryId: 'CVD Risk', Col1: 7, Col2: 8 },
            { category: 'Risk Factors' },
            { category: 'CVD Risk' },
          ],
          columns: [
            {
              category: 'By Gender',
              columns: [
                { key: 'Col1', title: 'Female' },
                { key: 'Col2', title: 'Male' },
              ],
            },
          ],
        },
      ));
  });
};
