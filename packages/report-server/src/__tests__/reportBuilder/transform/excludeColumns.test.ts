/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS } from './transform.fixtures';
import { buildTransform, TransformTable } from '../../../reportBuilder/transform';

describe('excludeColumns', () => {
  it('can exclude all fields', () => {
    const transform = buildTransform([
      {
        transform: 'excludeColumns',
        columns: '*',
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{}]),
    );
  });

  it('can exclude selected fields', () => {
    const transform = buildTransform([
      {
        transform: 'excludeColumns',
        columns: ['organisationUnit', 'value'],
      },
    ]);
    expect(transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', dataElement: 'BCD1' },
        { period: '20200102', dataElement: 'BCD1' },
        { period: '20200103', dataElement: 'BCD1' },
      ]),
    );
  });
});
