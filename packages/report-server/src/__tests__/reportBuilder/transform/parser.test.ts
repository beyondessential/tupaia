/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { PARSABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('parser', () => {
  it('groupRows supports parser lookups on where', () => {
    const transform = buildTransform([
      {
        transform: 'groupRows',
        mergeUsing: {
          organisationUnit: 'exclude',
          period: 'exclude',
          '*': 'sum',
        },
        where: "eq($organisationUnit, 'TO')",
      },
    ]);
    expect(transform(PARSABLE_ANALYTICS)).toEqual([
      { BCD1: 11 },
      { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
      { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
      { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
    ]);
  });

  it('excludeRows supports parser lookups', () => {
    const transform = buildTransform([
      {
        transform: 'excludeRows',
        where:
          '$BCD1 <= mean(@where(f(@otherRow) = eq($organisationUnit, @otherRow.organisationUnit)).BCD1)',
      },
    ]);
    expect(transform(PARSABLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
      { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
      { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
      { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
    ]);
  });

  it('updateColumns supports parser lookups', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          row: '$BCD1',
          lastAll: 'last(@all.BCD1)',
          sumAllPrevious: 'sum(@allPrevious.BCD1)',
          sumWhereMatchingOrgUnit:
            'sum(@where(f(@otherRow) = eq($organisationUnit, @otherRow.organisationUnit)).BCD1)',
        },
        exclude: '*',
      },
    ]);
    expect(transform(PARSABLE_ANALYTICS)).toEqual([
      { row: 4, lastAll: 2, sumAllPrevious: 4, sumWhereMatchingOrgUnit: 11 },
      { row: 2, lastAll: 2, sumAllPrevious: 6, sumWhereMatchingOrgUnit: 11 },
      { row: 5, lastAll: 2, sumAllPrevious: 11, sumWhereMatchingOrgUnit: 11 },
      { row: 7, lastAll: 2, sumAllPrevious: 18, sumWhereMatchingOrgUnit: 17 },
      { row: 8, lastAll: 2, sumAllPrevious: 26, sumWhereMatchingOrgUnit: 17 },
      { row: 2, lastAll: 2, sumAllPrevious: 28, sumWhereMatchingOrgUnit: 17 },
    ]);
  });

  it('sortRows supports row parser lookups', () => {
    const transform = buildTransform([
      {
        transform: 'sortRows',
        by: '=$BCD1',
      },
    ]);
    expect(transform(PARSABLE_ANALYTICS)).toEqual([
      { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
      { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
      { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
      { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
      { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
      { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
    ]);
  });
});
