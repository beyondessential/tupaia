/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SORTABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('sort', () => {
  it('can sort by a field value', () => {
    const transform = buildTransform([
      {
        transform: 'sort',
        by: '$row.period',
      },
    ]);
    expect(transform(SORTABLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
      { period: '20200101', organisationUnit: 'TO', BCD2: 11 },
      { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
      { period: '20200101', organisationUnit: 'PG', BCD2: 13 },
      { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
      { period: '20200102', organisationUnit: 'TO', BCD2: 1 },
      { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
      { period: '20200102', organisationUnit: 'PG', BCD2: 99 },
      { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
      { period: '20200103', organisationUnit: 'TO', BCD2: 0 },
      { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
      { period: '20200103', organisationUnit: 'PG', BCD2: -1 },
    ]);
  });

  it('can reverse sort by a field value', () => {
    const transform = buildTransform([
      {
        transform: 'sort',
        by: '$row.period',
        descending: true,
      },
    ]);
    expect(transform(SORTABLE_ANALYTICS)).toEqual([
      { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
      { period: '20200103', organisationUnit: 'TO', BCD2: 0 },
      { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
      { period: '20200103', organisationUnit: 'PG', BCD2: -1 },
      { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
      { period: '20200102', organisationUnit: 'TO', BCD2: 1 },
      { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
      { period: '20200102', organisationUnit: 'PG', BCD2: 99 },
      { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
      { period: '20200101', organisationUnit: 'TO', BCD2: 11 },
      { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
      { period: '20200101', organisationUnit: 'PG', BCD2: 13 },
    ]);
  });
});
