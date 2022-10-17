/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EXCLUDEABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform, TransformTable } from '../../../reportBuilder/transform';

describe('excludeRows', () => {
  it('can exclude by boolean expression on row', () => {
    const transform = buildTransform([
      {
        transform: 'excludeRows',
        where: '=$BCD1 < 6',
      },
    ]);
    expect(transform(TransformTable.fromRows(EXCLUDEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
      ]),
    );
  });
});
