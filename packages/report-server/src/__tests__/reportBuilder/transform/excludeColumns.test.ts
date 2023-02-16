/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS } from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('excludeColumns', () => {
  it('can exclude all fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'excludeColumns',
        columns: '*',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{}]),
    );
  });

  it('can exclude selected fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'excludeColumns',
        columns: ['organisationUnit', 'value'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', dataElement: 'BCD1' },
        { period: '20200102', dataElement: 'BCD1' },
        { period: '20200103', dataElement: 'BCD1' },
      ]),
    );
  });
});
