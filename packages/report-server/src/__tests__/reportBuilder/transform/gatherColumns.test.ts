/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MULTIPLE_ANALYTICS, SINGLE_ANALYTIC } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('gatherColumns', () => {
  it('can gather columns for single analytic', () => {
    const transform = buildTransform([
      {
        transform: 'gatherColumns',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { value: '20200101', columnName: 'period' },
      { value: 'TO', columnName: 'organisationUnit' },
      { value: 'BCD1', columnName: 'dataElement' },
      { value: 4, columnName: 'value' },
    ]);
  });

  it('can gather columns with one included field as string', () => {
    const transform = buildTransform([
      {
        transform: 'gatherColumns',
        keep: 'organisationUnit',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { organisationUnit: 'TO', value: '20200101', columnName: 'period' },
      { organisationUnit: 'TO', value: 'BCD1', columnName: 'dataElement' },
      { organisationUnit: 'TO', value: 4, columnName: 'value' },
    ]);
  });

  it('can gather columns with included fields', () => {
    const transform = buildTransform([
      {
        transform: 'gatherColumns',
        keep: ['organisationUnit', 'period'],
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { organisationUnit: 'TO', period: '20200101', value: 'BCD1', columnName: 'dataElement' },
      { organisationUnit: 'TO', period: '20200101', value: 4, columnName: 'value' },
    ]);
  });

  it('can gather columns for multiple analytics', () => {
    const transform = buildTransform([
      {
        transform: 'gatherColumns',
        keep: ['period'],
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { period: '20200101', value: 'TO', columnName: 'organisationUnit' },
      { period: '20200101', value: 'BCD1', columnName: 'dataElement' },
      { period: '20200101', value: 4, columnName: 'value' },
      { period: '20200102', value: 'TO', columnName: 'organisationUnit' },
      { period: '20200102', value: 'BCD1', columnName: 'dataElement' },
      { period: '20200102', value: 2, columnName: 'value' },
      { period: '20200103', value: 'TO', columnName: 'organisationUnit' },
      { period: '20200103', value: 'BCD1', columnName: 'dataElement' },
      { period: '20200103', value: 5, columnName: 'value' },
    ]);
  });
});
