/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SORTABLE_ANALYTICS } from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('sortRows', () => {
  it('throws an error if by is not specified', () => {
    expect(() =>
      buildTestTransform([
        {
          transform: 'sortRows',
          direction: 'asc',
        },
      ]),
    ).toThrow();
  });

  it('can sort by a column', async () => {
    const transform = buildTestTransform([
      {
        transform: 'sortRows',
        by: 'period',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SORTABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 11 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 13 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 99 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 0 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
        { period: '20200103', organisationUnit: 'PG', BCD1: -1 },
      ]),
    );
  });

  it('can reverse sort by a column', async () => {
    const transform = buildTestTransform([
      {
        transform: 'sortRows',
        by: 'period',
        direction: 'desc',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SORTABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 0 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
        { period: '20200103', organisationUnit: 'PG', BCD1: -1 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 99 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 11 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 13 },
      ]),
    );
  });

  it('can sort by multiple columns', async () => {
    const transform = buildTestTransform([
      {
        transform: 'sortRows',
        by: ['period', 'organisationUnit'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SORTABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 13 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 11 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 99 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
        { period: '20200103', organisationUnit: 'PG', BCD1: -1 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 0 },
      ]),
    );
  });

  it('can sort by different directions per column', async () => {
    const transform = buildTestTransform([
      {
        transform: 'sortRows',
        by: ['period', 'BCD1'],
        direction: ['asc', 'desc'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SORTABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'PG', BCD1: 13 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 11 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 99 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 0 },
        { period: '20200103', organisationUnit: 'PG', BCD1: -1 },
      ]),
    );
  });

  it('can sort by expressions', async () => {
    const transform = buildTestTransform([
      {
        transform: 'sortRows',
        by: '=$BCD1 * $BCD1',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SORTABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200103', organisationUnit: 'TO', BCD1: 0 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 1 },
        { period: '20200103', organisationUnit: 'PG', BCD1: -1 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 7 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8 },
        { period: '20200101', organisationUnit: 'TO', BCD1: 11 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 13 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 99 },
      ]),
    );
  });
});
