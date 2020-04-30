/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { createAssertTableResults } from './helpers';
import { DATA_VALUES } from './tableOfPercentagesOfValueCounts.fixtures';
import { tableOfPercentagesOfValueCounts } from '/apiV1/dataBuilders';

const assertTableResults = createAssertTableResults(
  tableOfPercentagesOfValueCounts,
  DATA_VALUES.filter(({ organisationUnit }) => organisationUnit === 'TO_Nukuhc'),
);

describe('tableOfPercentagesOfDataCounts', () => {
  describe('basic', () => {
    it('2 row x 2 col', () =>
      assertTableResults(
        {
          rows: ['Water for hand washing', 'Soap for hand washing'],
          columns: [
            '% of facilities with commodity in stock',
            '% of facilities with commodity out of stock',
          ],
          cells: [
            [
              {
                numerator: {
                  dataValues: ['COV10'],
                  valueOfInterest: 1,
                },
                denominator: { dataValues: ['COV10'], valueOfInterest: '*' },
                key: 'COV10_Yes',
              },
              {
                numerator: {
                  dataValues: ['COV10'],
                  valueOfInterest: 0,
                },
                denominator: { dataValues: ['COV10'], valueOfInterest: '*' },
                key: 'COV10_No',
              },
            ],
            [
              {
                numerator: {
                  dataValues: ['COV11'],
                  valueOfInterest: 1,
                },
                denominator: { dataValues: ['COV11'], valueOfInterest: '*' },
                key: 'COV11_Yes',
              },
              {
                numerator: {
                  dataValues: ['COV11'],
                  valueOfInterest: { operator: '>=', value: 2 },
                },
                denominator: { dataValues: ['COV11'], valueOfInterest: '*' },
                key: 'COV11_No',
              },
            ],
          ],
        },
        {
          rows: [
            { dataElement: 'Water for hand washing', Col1: 0.2, Col2: 0.8 },
            { dataElement: 'Soap for hand washing', Col1: 0.6, Col2: 0.4 },
          ],
          columns: [
            { key: 'Col1', title: '% of facilities with commodity in stock' },
            { key: 'Col2', title: '% of facilities with commodity out of stock' },
          ],
        },
      ));
  });

  describe('categories', () => {
    it('2 categories x 2 rows, 1 category x 2 columns, ', () =>
      assertTableResults(
        {
          rows: [
            { category: 'Hand washing', rows: ['Water for hand washing', 'Soap for hand washing'] },
            { category: 'Respiratory equipment', rows: ['Oxygen bottles', 'Oxygen masks'] },
          ],
          columns: [{ category: 'Availability', columns: ['Available', 'Unavailable'] }],
          cells: [
            [
              {
                numerator: {
                  dataValues: ['COV10'],
                  valueOfInterest: 1,
                },
                denominator: { dataValues: ['COV10'], valueOfInterest: '*' },
                key: 'COV10_Yes',
              },
              {
                numerator: {
                  dataValues: ['COV10'],
                  valueOfInterest: 0,
                },
                denominator: { dataValues: ['COV10'], valueOfInterest: '*' },
                key: 'COV10_No',
              },
            ],
            [
              {
                numerator: {
                  dataValues: ['COV11'],
                  valueOfInterest: 1,
                },
                denominator: { dataValues: ['COV11'], valueOfInterest: '*' },
                key: 'COV11_Yes',
              },
              {
                numerator: {
                  dataValues: ['COV11'],
                  valueOfInterest: { operator: '>=', value: 2 },
                },
                denominator: { dataValues: ['COV11'], valueOfInterest: '*' },
                key: 'COV11_No',
              },
            ],
            [
              {
                numerator: {
                  dataValues: ['COV27'],
                  valueOfInterest: { operator: '>=', value: 1 },
                },
                denominator: { dataValues: ['COV27'], valueOfInterest: '*' },
                key: 'COV27_Yes',
              },
              {
                numerator: {
                  dataValues: ['COV27'],
                  valueOfInterest: 0,
                },
                denominator: { dataValues: ['COV27'], valueOfInterest: '*' },
                key: 'COV27_No',
              },
            ],
            [
              {
                numerator: {
                  dataValues: ['COV28'],
                  valueOfInterest: { operator: '>=', value: 1 },
                },
                denominator: { dataValues: ['COV28'], valueOfInterest: '*' },
                key: 'COV28_Yes',
              },
              {
                numerator: {
                  dataValues: ['COV28'],
                  valueOfInterest: 0,
                },
                denominator: { dataValues: ['COV28'], valueOfInterest: '*' },
                key: 'COV28_No',
              },
            ],
          ],
        },
        {
          rows: [
            {
              dataElement: 'Water for hand washing',
              categoryId: 'Hand washing',
              Col1: 0.2,
              Col2: 0.8,
            },
            {
              dataElement: 'Soap for hand washing',
              categoryId: 'Hand washing',
              Col1: 0.6,
              Col2: 0.4,
            },
            {
              dataElement: 'Oxygen bottles',
              categoryId: 'Respiratory equipment',
              Col1: 0.9,
              Col2: 0.1,
            },
            {
              dataElement: 'Oxygen masks',
              categoryId: 'Respiratory equipment',
              Col1: 0.6666666666666666,
              Col2: 0.3333333333333333,
            },
            { category: 'Hand washing' },
            { category: 'Respiratory equipment' },
          ],
          columns: [
            {
              category: 'Availability',
              columns: [
                { key: 'Col1', title: 'Available' },
                { key: 'Col2', title: 'Unavailable' },
              ],
            },
          ],
        },
      ));
  });
});
