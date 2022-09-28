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

export const testNoCategories = () => {
  it('1x1', async () =>
    assertTableResults(
      {
        rows: ['Smokers'],
        columns: ['Female'],
        cells: [['CD1']],
      },
      {
        rows: [{ dataElement: 'Smokers', Col1: 1 }],
        columns: [{ key: 'Col1', title: 'Female' }],
      },
    ));

  it('1x2', async () =>
    assertTableResults(
      {
        rows: ['Smokers'],
        columns: ['Female', 'Male'],
        cells: [['CD1', 'CD2']],
      },
      {
        rows: [{ dataElement: 'Smokers', Col1: 1, Col2: 2 }],
        columns: [
          { key: 'Col1', title: 'Female' },
          { key: 'Col2', title: 'Male' },
        ],
      },
    ));

  it('2x1', async () =>
    assertTableResults(
      {
        rows: ['Smokers', 'Overweight'],
        columns: ['Female'],
        cells: [['CD1'], ['CD3']],
      },
      {
        rows: [
          { dataElement: 'Smokers', Col1: 1 },
          { dataElement: 'Overweight', Col1: 3 },
        ],
        columns: [{ key: 'Col1', title: 'Female' }],
      },
    ));

  it('2x2', async () =>
    assertTableResults(
      {
        rows: ['Smokers', 'Overweight'],
        columns: ['Female', 'Male'],
        cells: [
          ['CD1', 'CD2'],
          ['CD3', 'CD4'],
        ],
      },
      {
        rows: [
          { dataElement: 'Smokers', Col1: 1, Col2: 2 },
          { dataElement: 'Overweight', Col1: 3, Col2: 4 },
        ],
        columns: [
          { key: 'Col1', title: 'Female' },
          { key: 'Col2', title: 'Male' },
        ],
      },
    ));

  it('rows with same title', async () =>
    assertTableResults(
      {
        rows: ['Female', 'Female'],
        columns: ['Count'],
        cells: [['CD1'], ['CD5']],
      },
      {
        rows: [
          { dataElement: 'Female', Col1: 1 },
          { dataElement: 'Female', Col1: 5 },
        ],
        columns: [{ key: 'Col1', title: 'Count' }],
      },
    ));

  it('columns with same title', async () =>
    assertTableResults(
      {
        rows: ['Female'],
        columns: ['Count', 'Count'],
        cells: [['CD1', 'CD5']],
      },
      {
        rows: [{ dataElement: 'Female', Col1: 1, Col2: 5 }],
        columns: [
          { key: 'Col1', title: 'Count' },
          { key: 'Col2', title: 'Count' },
        ],
      },
    ));

  it('should ignore empty cells', async () =>
    assertTableResults(
      {
        rows: ['Smokers', 'Overweight'],
        columns: ['Female', 'Male'],
        cells: [
          ['CD1', ''],
          ['', ''],
        ],
      },
      {
        rows: [
          { dataElement: 'Smokers', Col1: 1, Col2: '' },
          { dataElement: 'Overweight', Col1: '', Col2: '' },
        ],
        columns: [
          { key: 'Col1', title: 'Female' },
          { key: 'Col2', title: 'Male' },
        ],
      },
    ));

  it('should build rows from data values', async () =>
    assertTableResults(
      {
        rows: [
          {
            code: 'CD1',
            name: 'Risk Factor: Smokers Female',
          },
          {
            code: 'DoesntExist',
            name: 'This should not be added to rows',
          },
        ],
        columns: ['Female'],
        cells: [['CD1']],
      },
      {
        rows: [{ dataElement: 'Risk Factor: Smokers Female', Col1: 1 }],
        columns: [{ key: 'Col1', title: 'Female' }],
      },
    ));

  it('should fetch rowInfo from data', async () =>
    assertTableResults(
      {
        rows: [
          {
            code: 'CD1',
            name: 'Risk Factor: Smokers Female',
            descriptionDataElement: 'CD_Description',
          },
        ],
        columns: ['Female'],
        cells: [['CD1']],
      },
      {
        rows: [
          {
            dataElement: 'Risk Factor: Smokers Female',
            Col1: 1,
            rowInfo: 'Communicable diseases description',
          },
        ],
        columns: [{ key: 'Col1', title: 'Female' }],
      },
    ));
};
