/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { createAssertTableResults } from './helpers';
import { DATA_VALUES } from './tableOfDataValues.fixtures';
import { tableOfDataValues } from '/apiV1/dataBuilders';

const assertTableResults = createAssertTableResults(
  tableOfDataValues,
  DATA_VALUES.filter(({ organisationUnit }) => organisationUnit === 'TO_HvlMCH'),
);

export const testOptions = () => {
  it('1x1', async () =>
    assertTableResults(
      {
        rows: ['Smokers'],
        columns: ['Female'],
        cells: [['HP1']],
      },
      {
        rows: [{ dataElement: 'Smokers', Col1: 'One' }],
        columns: [{ key: 'Col1', title: 'Female' }],
      },
    ));

  it('1x2', async () =>
    assertTableResults(
      {
        rows: ['Smokers'],
        columns: ['Female', 'Male'],
        cells: [['HP1', 'HP2']],
      },
      {
        rows: [{ dataElement: 'Smokers', Col1: 'One', Col2: 'Two' }],
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
        cells: [['HP1'], ['HP3']],
      },
      {
        rows: [
          { dataElement: 'Smokers', Col1: 'One' },
          { dataElement: 'Overweight', Col1: 'Three' },
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
          ['HP1', 'HP2'],
          ['HP3', 'HP4'],
        ],
      },
      {
        rows: [
          { dataElement: 'Smokers', Col1: 'One', Col2: 'Two' },
          { dataElement: 'Overweight', Col1: 'Three', Col2: 'Four' },
        ],
        columns: [
          { key: 'Col1', title: 'Female' },
          { key: 'Col2', title: 'Male' },
        ],
      },
    ));

  it('table total', async () =>
    assertTableResults(
      {
        rows: ['Smokers', 'Overweight', 'Total'],
        columns: ['Female', 'Male', 'Total'],
        cells: [
          ['HP1', 'HP2'],
          ['HP3', 'HP4'],
          ['', '', '$total'],
        ],
      },
      {
        rows: [
          { dataElement: 'Smokers', Col1: 'One', Col2: 'Two' },
          { dataElement: 'Overweight', Col1: 'Three', Col2: 'Four' },
          { dataElement: 'Total', Col1: '', Col2: '', Col3: 0 },
        ],
        columns: [
          { key: 'Col1', title: 'Female' },
          { key: 'Col2', title: 'Male' },
          { key: 'Col3', title: 'Total' },
        ],
      },
    ));
};
