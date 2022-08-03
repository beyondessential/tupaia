/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MULTIPLE_ANALYTICS, SINGLE_ANALYTIC } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('transposeTable', () => {
  it('can transpose table for single analytic', () => {
    const transform = buildTransform([
      {
        transform: 'transposeTable',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { value: '20200101', type: 'period' },
      { value: 'TO', type: 'organisationUnit' },
      { value: 'BCD1', type: 'dataElement' },
      { value: 4, type: 'value' },
    ]);
  });

  it('can transpose table with one reserved field as string', () => {
    const transform = buildTransform([
      {
        transform: 'transposeTable',
        reserve: 'organisationUnit',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { organisationUnit: 'TO', value: '20200101', type: 'period' },
      { organisationUnit: 'TO', value: 'BCD1', type: 'dataElement' },
      { organisationUnit: 'TO', value: 4, type: 'value' },
    ]);
  });

  it('can transpose table with reserved fields', () => {
    const transform = buildTransform([
      {
        transform: 'transposeTable',
        reserve: ['organisationUnit', 'period'],
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { organisationUnit: 'TO', period: '20200101', value: 'BCD1', type: 'dataElement' },
      { organisationUnit: 'TO', period: '20200101', value: 4, type: 'value' },
    ]);
  });

  it('can transpose table for multiple analytics', () => {
    const transform = buildTransform([
      {
        transform: 'transposeTable',
        reserve: ['period'],
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { period: '20200101', value: 'TO', type: 'organisationUnit' },
      { period: '20200101', value: 'BCD1', type: 'dataElement' },
      { period: '20200101', value: 4, type: 'value' },
      { period: '20200102', value: 'TO', type: 'organisationUnit' },
      { period: '20200102', value: 'BCD1', type: 'dataElement' },
      { period: '20200102', value: 2, type: 'value' },
      { period: '20200103', value: 'TO', type: 'organisationUnit' },
      { period: '20200103', value: 'BCD1', type: 'dataElement' },
      { period: '20200103', value: 5, type: 'value' },
    ]);
  });
});
