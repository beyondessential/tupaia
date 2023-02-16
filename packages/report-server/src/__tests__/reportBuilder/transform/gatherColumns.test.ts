/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MULTIPLE_ANALYTICS, SINGLE_ANALYTIC } from './transform.fixtures';
import { TransformTable } from '../../../reportBuilder/transform';
import { buildTestTransform } from '../testUtils';

describe('gatherColumns', () => {
  it('can gather columns for single analytic', async () => {
    const transform = buildTestTransform([
      {
        transform: 'gatherColumns',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([
        { value: '20200101', columnName: 'period' },
        { value: 'TO', columnName: 'organisationUnit' },
        { value: 'BCD1', columnName: 'dataElement' },
        { value: 4, columnName: 'value' },
      ]),
    );
  });

  it('can gather columns with one included field as string', async () => {
    const transform = buildTestTransform([
      {
        transform: 'gatherColumns',
        keep: 'organisationUnit',
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([
        { organisationUnit: 'TO', value: '20200101', columnName: 'period' },
        { organisationUnit: 'TO', value: 'BCD1', columnName: 'dataElement' },
        { organisationUnit: 'TO', value: 4, columnName: 'value' },
      ]),
    );
  });

  it('can gather columns with included fields', async () => {
    const transform = buildTestTransform([
      {
        transform: 'gatherColumns',
        keep: ['organisationUnit', 'period'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', value: 'BCD1', columnName: 'dataElement' },
        { period: '20200101', organisationUnit: 'TO', value: 4, columnName: 'value' },
      ]),
    );
  });

  it('can gather columns for multiple analytics', async () => {
    const transform = buildTestTransform([
      {
        transform: 'gatherColumns',
        keep: ['period'],
      },
    ]);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', value: 'TO', columnName: 'organisationUnit' },
        { period: '20200101', value: 'BCD1', columnName: 'dataElement' },
        { period: '20200101', value: 4, columnName: 'value' },
        { period: '20200102', value: 'TO', columnName: 'organisationUnit' },
        { period: '20200102', value: 'BCD1', columnName: 'dataElement' },
        { period: '20200102', value: 2, columnName: 'value' },
        { period: '20200103', value: 'TO', columnName: 'organisationUnit' },
        { period: '20200103', value: 'BCD1', columnName: 'dataElement' },
        { period: '20200103', value: 5, columnName: 'value' },
      ]),
    );
  });
});
