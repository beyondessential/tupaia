/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey } from '@tupaia/utils';
import { createAssertTableResults } from './helpers';
import { DATA_VALUES } from './tableOfDataValues.fixtures';
import { tableOfDataValues } from '/apiV1/dataBuilders';

const assertTableResults = createAssertTableResults(
  tableOfDataValues,
  // Sort results in DESC org unit order, to assert their ASC ordering in the results
  DATA_VALUES.filter(
    ({ organisationUnit }) => organisationUnit === 'TO_Nukuhc' || organisationUnit === 'TO_Vainihc',
  ).sort(getSortByKey('organisationUnit', { ascending: false })),
);

export const testOrgUnitCategories = () => {
  describe('row org unit categories', () => {
    it('no column categories', async () =>
      assertTableResults(
        {
          rows: [{ category: '$orgUnit', rows: ['Smokers'] }],
          columns: ['Female', 'Male'],
          cells: [['CD1', 'CD2']],
        },
        {
          rows: [
            { dataElement: 'Smokers', categoryId: 'TO_Nukuhc', Col1: 1, Col2: 2 },
            { dataElement: 'Smokers', categoryId: 'TO_Vainihc', Col1: 10, Col2: 20 },
            { category: 'Nukunuku' },
            { category: 'Vaini' },
          ],
          columns: [
            { key: 'Col1', title: 'Female' },
            { key: 'Col2', title: 'Male' },
          ],
        },
      ));

    it('specified column categories', async () =>
      assertTableResults(
        {
          rows: [{ category: '$orgUnit', rows: ['Female', 'Male'] }],
          columns: [
            { category: 'Risk Factor', columns: ['Smokers', 'Overweight'] },
            { category: 'CVD Risk', columns: ['Green', 'Red'] },
          ],
          cells: [
            ['CD1', 'CD3', 'CD5', 'CD7'],
            ['CD2', 'CD4', 'CD6', 'CD8'],
          ],
        },
        {
          rows: [
            { dataElement: 'Female', categoryId: 'TO_Nukuhc', Col1: 1, Col2: 3, Col3: 5, Col4: 7 },
            { dataElement: 'Male', categoryId: 'TO_Nukuhc', Col1: 2, Col2: 4, Col3: 6, Col4: 8 },
            {
              dataElement: 'Female',
              categoryId: 'TO_Vainihc',
              Col1: 10,
              Col2: 30,
              Col3: 50,
              Col4: 70,
            },
            {
              dataElement: 'Male',
              categoryId: 'TO_Vainihc',
              Col1: 20,
              Col2: 40,
              Col3: 60,
              Col4: 80,
            },
            { category: 'Nukunuku' },
            { category: 'Vaini' },
          ],
          columns: [
            {
              category: 'Risk Factor',
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
  });

  describe('column org unit categories', () => {
    it('no row categories', async () =>
      assertTableResults(
        {
          rows: ['Female', 'Male'],
          columns: [{ category: '$orgUnit', columns: ['Smokers'] }],
          cells: [['CD1'], ['CD2']],
        },
        {
          rows: [
            { dataElement: 'Female', Col1: 1, Col2: 10 },
            { dataElement: 'Male', Col1: 2, Col2: 20 },
          ],
          columns: [
            {
              category: 'Nukunuku',
              columns: [{ key: 'Col1', title: 'Smokers' }],
            },
            {
              category: 'Vaini',
              columns: [{ key: 'Col2', title: 'Smokers' }],
            },
          ],
        },
      ));

    it('specified row categories', async () =>
      assertTableResults(
        {
          rows: [
            { category: 'Risk Factor', rows: ['Smokers', 'Overweight'] },
            { category: 'CVD Risk', rows: ['Green', 'Red'] },
          ],
          columns: [{ category: '$orgUnit', columns: ['Female', 'Male'] }],
          cells: [
            ['CD1', 'CD2'],
            ['CD3', 'CD4'],
            ['CD5', 'CD6'],
            ['CD7', 'CD8'],
          ],
        },
        {
          rows: [
            {
              dataElement: 'Smokers',
              categoryId: 'Risk Factor',
              Col1: 1,
              Col2: 2,
              Col3: 10,
              Col4: 20,
            },
            {
              dataElement: 'Overweight',
              categoryId: 'Risk Factor',
              Col1: 3,
              Col2: 4,
              Col3: 30,
              Col4: 40,
            },
            {
              dataElement: 'Green',
              categoryId: 'CVD Risk',
              Col1: 5,
              Col2: 6,
              Col3: 50,
              Col4: 60,
            },
            {
              dataElement: 'Red',
              categoryId: 'CVD Risk',
              Col1: 7,
              Col2: 8,
              Col3: 70,
              Col4: 80,
            },
            { category: 'Risk Factor' },
            { category: 'CVD Risk' },
          ],
          columns: [
            {
              category: 'Nukunuku',
              columns: [
                { key: 'Col1', title: 'Female' },
                { key: 'Col2', title: 'Male' },
              ],
            },
            {
              category: 'Vaini',
              columns: [
                { key: 'Col3', title: 'Female' },
                { key: 'Col4', title: 'Male' },
              ],
            },
          ],
        },
      ));
  });
};
