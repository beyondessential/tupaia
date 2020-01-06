/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { createAssertTableResults } from './helpers';
import { DATA_VALUES } from './tableOfDataValues.fixtures';

const assertTableResults = createAssertTableResults(
  DATA_VALUES.filter(({ organisationUnit }) => organisationUnit === 'TO_Nukuhc'),
);

export const testNoCategories = () => {
  it('1x1', () =>
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

  it('1x2', () =>
    assertTableResults(
      {
        rows: ['Smokers'],
        columns: ['Female', 'Male'],
        cells: [['CD1', 'CD2']],
      },
      {
        rows: [{ dataElement: 'Smokers', Col1: 1, Col2: 2 }],
        columns: [{ key: 'Col1', title: 'Female' }, { key: 'Col2', title: 'Male' }],
      },
    ));

  it('2x1', () =>
    assertTableResults(
      {
        rows: ['Smokers', 'Overweight'],
        columns: ['Female'],
        cells: [['CD1'], ['CD3']],
      },
      {
        rows: [{ dataElement: 'Smokers', Col1: 1 }, { dataElement: 'Overweight', Col1: 3 }],
        columns: [{ key: 'Col1', title: 'Female' }],
      },
    ));

  it('2x2', () =>
    assertTableResults(
      {
        rows: ['Smokers', 'Overweight'],
        columns: ['Female', 'Male'],
        cells: [['CD1', 'CD2'], ['CD3', 'CD4']],
      },
      {
        rows: [
          { dataElement: 'Smokers', Col1: 1, Col2: 2 },
          { dataElement: 'Overweight', Col1: 3, Col2: 4 },
        ],
        columns: [{ key: 'Col1', title: 'Female' }, { key: 'Col2', title: 'Male' }],
      },
    ));

  it('rows with same title', () =>
    assertTableResults(
      {
        rows: ['Female', 'Female'],
        columns: ['Count'],
        cells: [['CD1'], ['CD5']],
      },
      {
        rows: [{ dataElement: 'Female', Col1: 1 }, { dataElement: 'Female', Col1: 5 }],
        columns: [{ key: 'Col1', title: 'Count' }],
      },
    ));

  it('columns with same title', () =>
    assertTableResults(
      {
        rows: ['Female'],
        columns: ['Count', 'Count'],
        cells: [['CD1', 'CD5']],
      },
      {
        rows: [{ dataElement: 'Female', Col1: 1, Col2: 5 }],
        columns: [{ key: 'Col1', title: 'Count' }, { key: 'Col2', title: 'Count' }],
      },
    ));
};
