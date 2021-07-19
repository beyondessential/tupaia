/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS } from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('insert', () => {
  // SAME AS SELECT FUNCTIONALITY
  it('can insert row with basic values', () => {
    const transform = buildTransform([
      {
        transform: 'insert',
        "'number'": '1',
        "'string'": "'Hi'",
        "'boolean'": 'false',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([...SINGLE_ANALYTIC, { number: 1, string: 'Hi', boolean: false }]);
  });

  it('can insert row with values from previous row', () => {
    const transform = buildTransform([
      {
        transform: 'insert',
        "'dataElementValue'": '$row.value',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([...SINGLE_ANALYTIC, { dataElementValue: 4 }]);
  });

  it('can select a value from the row as a field name', () => {
    const transform = buildTransform([
      {
        transform: 'insert',
        '$row.dataElement': '$row.value',
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([...SINGLE_ANALYTIC, { BCD1: 4 }]);
  });

  it('can execute functions', () => {
    const transform = buildTransform([
      {
        transform: 'insert',
        "'period'": "periodToDisplayString($row.period, 'DAY')",
      },
    ]);
    expect(transform(SINGLE_ANALYTIC)).toEqual([...SINGLE_ANALYTIC, { period: '1st Jan 2020' }]);
  });

  // SPECIFIC TO INSERT
  it('can insert multiple rows', () => {
    const transform = buildTransform([
      {
        transform: 'insert',
        "'dataElementValue'": '$row.value',
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
      { dataElementValue: 4 },
      { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
      { dataElementValue: 2 },
      { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
      { dataElementValue: 5 },
    ]);
  });

  it('can insert new rows before the relative row', () => {
    const transform = buildTransform([
      {
        transform: 'insert',
        "'dataElementValue'": '$row.value',
        position: 'before',
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { dataElementValue: 4 },
      { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
      { dataElementValue: 2 },
      { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
      { dataElementValue: 5 },
      { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
    ]);
  });

  it('can insert new rows at the beginning of the list', () => {
    const transform = buildTransform([
      {
        transform: 'insert',
        "'dataElementValue'": '$row.value',
        position: 'start',
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { dataElementValue: 4 },
      { dataElementValue: 2 },
      { dataElementValue: 5 },
      { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
      { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
      { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
    ]);
  });

  it('can insert specific new rows using a where clause', () => {
    const transform = buildTransform([
      {
        transform: 'insert',
        "'dataElementValue'": '$row.value',
        position: 'after',
        where: "not(eq($row.period, '20200101'))",
      },
    ]);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
      { period: '20200102', organisationUnit: 'TO', dataElement: 'BCD1', value: 2 },
      { dataElementValue: 2 },
      { period: '20200103', organisationUnit: 'TO', dataElement: 'BCD1', value: 5 },
      { dataElementValue: 5 },
    ]);
  });
});
