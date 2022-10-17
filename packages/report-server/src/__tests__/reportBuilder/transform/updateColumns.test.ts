/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS, MERGEABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform, TransformTable } from '../../../reportBuilder/transform';

describe('updateColumns', () => {
  it('can do nothing', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0] }]),
    );
  });

  it('can insert basic values', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          number: '=1',
          string: 'Hi',
          boolean: '=false',
        },
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], number: 1, string: 'Hi', boolean: false }]),
    );
  });

  it('can update a value from the row', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          dataElementValue: '=$value',
        },
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], dataElementValue: 4 }]),
    );
  });

  it('can use a value from the row as a column name', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          '=$dataElement': '=$value',
        },
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], BCD1: 4 }]),
    );
  });

  it('can execute functions', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], period: '1st Jan 2020' }]),
    );
  });

  it('can include all remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
        include: '*',
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([
        { period: '1st Jan 2020', organisationUnit: 'TO', dataElement: 'BCD1', value: 4 },
      ]),
    );
  });

  it('can include selected remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
        include: ['organisationUnit', 'value'],
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ organisationUnit: 'TO', value: 4, period: '1st Jan 2020' }]),
    );
  });

  it('can exclude all remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
        exclude: '*',
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ period: '1st Jan 2020' }]),
    );
  });

  it('can exclude selected remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
        exclude: ['organisationUnit', 'value'],
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ period: '1st Jan 2020', dataElement: 'BCD1' }]),
    );
  });

  it('can perform the update on all rows', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        insert: {
          period: "=periodToDisplayString($period, 'DAY')",
          '=$dataElement': '=$value',
        },
        include: ['organisationUnit'],
      },
    ]);
    expect(transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { organisationUnit: 'TO', period: '1st Jan 2020', BCD1: 4 },
        { organisationUnit: 'TO', period: '2nd Jan 2020', BCD1: 2 },
        { organisationUnit: 'TO', period: '3rd Jan 2020', BCD1: 5 },
      ]),
    );
  });

  it('where is processed before remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'updateColumns',
        where: '=exists($BCD1)',
        insert: {
          newVal: '=$BCD1 * 2', // This would fail on rows where BCD1 doesn't exist
        },
        include: ['period', 'organisationUnit'],
      },
    ]);
    expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
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
      ]),
    );
  });
});
