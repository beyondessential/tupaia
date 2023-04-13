/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EXCLUDEABLE_ANALYTICS } from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('excludeRows', () => {
  it('can exclude by boolean expression on row', async () => {
    const transform = buildTestTransform([
      {
        transform: 'excludeRows',
        where: '=$BCD1 < 6',
      },
    ]);
    expect(await transform(TransformTable.fromRows(EXCLUDEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
      ]),
    );
  });
});
