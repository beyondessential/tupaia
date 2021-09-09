/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS, AGGREGATEABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('select', () => {
  it('can select a basic value', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        "'number'": '1',
        "'string'": "'Hi'",
        "'boolean'": 'false',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ number: 1, string: 'Hi', boolean: false }]);
  });

  it('can select a value from the row', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        "'dataElementValue'": '$row.value',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ dataElementValue: 4 }]);
  });

  it('can select a value from the row as a field name', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        '$row.dataElement': '$row.value',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ BCD1: 4 }]);
  });

  it('can execute functions', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        "'period'": "periodToDisplayString($row.period, 'DAY')",
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ period: '1st Jan 2020' }]);
  });

  it('can spread all remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        "'period'": "periodToDisplayString($row.period, 'DAY')",
        '...': '*',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { period: '1st Jan 2020', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
    ]);
  });

  it('can spread selected remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        "'period'": "periodToDisplayString($row.period, 'DAY')",
        '...': ['organisationUnit', 'value'],
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([
      { period: '1st Jan 2020', organisationUnit: 'TO', value: 4 },
    ]);
  });

  it('can perform the select on all rows', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        "'period'": "periodToDisplayString($row.period, 'DAY')",
        '$row.dataElement': '$row.value',
        '...': ['organisationUnit'],
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { period: '1st Jan 2020', organisationUnit: 'TO', BCD1: 4 },
      { period: '2nd Jan 2020', organisationUnit: 'TO', BCD1: 2 },
      { period: '3rd Jan 2020', organisationUnit: 'TO', BCD1: 5 },
    ]);
  });

  it('where is processed before remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'select',
        where: 'exists($row.BCD1)',
        "'newVal'": '$row.BCD1 * 2', // This would fail on rows where BCD1 doesn't exist
        '...': ['period', 'organisationUnit'],
      }
    ]);
    expect(transform(AGGREGATEABLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'TO', newVal: 8 },
      { period: '20200102', organisationUnit: 'TO', newVal: 4 },
      { period: '20200103', organisationUnit: 'TO', newVal: 10 },
      { period: '20200101', organisationUnit: 'TO', BCD2: 11 },
      { period: '20200102', organisationUnit: 'TO', BCD2: 1 },
      { period: '20200103', organisationUnit: 'TO', BCD2: 0 },
      { period: '20200101', organisationUnit: 'PG', newVal: 14 },
      { period: '20200102', organisationUnit: 'PG', newVal: 16 },
      { period: '20200103', organisationUnit: 'PG', newVal: 4 },
      { period: '20200101', organisationUnit: 'PG', BCD2: 13 },
      { period: '20200102', organisationUnit: 'PG', BCD2: 99 },
      { period: '20200103', organisationUnit: 'PG', BCD2: -1 },
    ]);
  });
});
