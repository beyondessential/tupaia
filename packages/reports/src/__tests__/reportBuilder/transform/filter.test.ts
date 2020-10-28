/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { FILTERABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('filter', () => {
  it('can filter by boolean expression on field value', () => {
    const transform = buildTransform([
      {
        transform: 'filter',
        where: '$.row.BCD1 > 5',
      },
    ]);
    expect(transform(FILTERABLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
      { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
    ]);
  });
});
