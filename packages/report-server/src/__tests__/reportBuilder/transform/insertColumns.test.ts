/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS, MERGEABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('insertColumns', () => {
  it('can insert basic values', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        columns: {
          number: '1',
          string: "'Hi'",
          boolean: 'false',
        },
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { ...SINGLE_ANALYTIC[0], number: 1, string: 'Hi', boolean: false },
    ]);
  });

  it('can insert using a value from the row', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        columns: {
          dataElementValue: '$row.value',
        },
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ ...SINGLE_ANALYTIC[0], dataElementValue: 4 }]);
  });

  it('can use a value from the row as a column name', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        columns: {
          '=$row.dataElement': '$row.value',
        },
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ ...SINGLE_ANALYTIC[0], BCD1: 4 }]);
  });

  it('can execute functions', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        columns: {
          period: "periodToDisplayString($row.period, 'DAY')",
        },
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ ...SINGLE_ANALYTIC[0], period: '1st Jan 2020' }]);
  });

  it('can perform the insert on all rows', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        columns: {
          period: "periodToDisplayString($row.period, 'DAY')",
          '=$row.dataElement': '$row.value',
        },
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { ...MULTIPLE_ANALYTICS[0], period: '1st Jan 2020', BCD1: 4 },
      { ...MULTIPLE_ANALYTICS[1], period: '2nd Jan 2020', BCD1: 2 },
      { ...MULTIPLE_ANALYTICS[2], period: '3rd Jan 2020', BCD1: 5 },
    ]);
  });

  it('where is processed before remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        where: 'exists($row.BCD1)',
        columns: {
          newVal: '$row.BCD1 * 2', // This would fail on rows where BCD1 doesn't exist
        },
      },
    ]);
    expect(transform(MERGEABLE_ANALYTICS)).toEqual([
      { ...MERGEABLE_ANALYTICS[0], newVal: 8 },
      { ...MERGEABLE_ANALYTICS[1], newVal: 4 },
      { ...MERGEABLE_ANALYTICS[2], newVal: 10 },
      { ...MERGEABLE_ANALYTICS[3] },
      { ...MERGEABLE_ANALYTICS[4] },
      { ...MERGEABLE_ANALYTICS[5] },
      { ...MERGEABLE_ANALYTICS[6], newVal: 14 },
      { ...MERGEABLE_ANALYTICS[7], newVal: 16 },
      { ...MERGEABLE_ANALYTICS[8], newVal: 4 },
      { ...MERGEABLE_ANALYTICS[9] },
      { ...MERGEABLE_ANALYTICS[10] },
      { ...MERGEABLE_ANALYTICS[11] },
    ]);
  });
});
