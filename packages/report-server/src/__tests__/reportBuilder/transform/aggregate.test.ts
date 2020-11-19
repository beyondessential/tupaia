/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AGGREGATEABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('aggregate', () => {
  it('can not group by a any field', () => {
    const transform = buildTransform([
      {
        transform: 'aggregate',
        organisationUnit: 'drop',
        period: 'drop',
        '...': 'sum',
      },
    ]);
    expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([{ BCD1: 28, BCD2: 123 }]);
  });

  it('can group by a single field', () => {
    const transform = buildTransform([
      {
        transform: 'aggregate',
        organisationUnit: 'group',
        '...': 'last',
      },
    ]);
    expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
      { organisationUnit: 'TO', period: '20200103', BCD1: 5, BCD2: 0 },
      { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
    ]);
  });

  it('can group by a multiple fields', () => {
    const transform = buildTransform([
      {
        transform: 'aggregate',
        organisationUnit: 'group',
        period: 'group',
        '...': 'sum',
      },
    ]);
    expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
      { organisationUnit: 'TO', period: '20200101', BCD1: 4, BCD2: 11 },
      { organisationUnit: 'TO', period: '20200102', BCD1: 2, BCD2: 1 },
      { organisationUnit: 'TO', period: '20200103', BCD1: 5, BCD2: 0 },
      { organisationUnit: 'PG', period: '20200101', BCD1: 7, BCD2: 13 },
      { organisationUnit: 'PG', period: '20200102', BCD1: 8, BCD2: 99 },
      { organisationUnit: 'PG', period: '20200103', BCD1: 2, BCD2: -1 },
    ]);
  });
});
