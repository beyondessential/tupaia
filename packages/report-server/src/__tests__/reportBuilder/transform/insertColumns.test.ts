/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { SINGLE_ANALYTIC, MULTIPLE_ANALYTICS, MERGEABLE_ANALYTICS } from './transform.fixtures';
import { buildTransform, TransformTable } from '../../../reportBuilder/transform';

describe('insertColumns', () => {
  it('can insert basic values', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        columns: {
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

  it('can insert using a value from the row', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        columns: {
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
        transform: 'insertColumns',
        columns: {
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
        transform: 'insertColumns',
        columns: {
          period: "=periodToDisplayString($period, 'DAY')",
        },
      },
    ]);
    expect(transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], period: '1st Jan 2020' }]),
    );
  });

  it('can perform the insert on all rows', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        columns: {
          period: "=periodToDisplayString($period, 'DAY')",
          '=$dataElement': '=$value',
        },
      },
    ]);
    expect(transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { ...MULTIPLE_ANALYTICS[0], period: '1st Jan 2020', BCD1: 4 },
        { ...MULTIPLE_ANALYTICS[1], period: '2nd Jan 2020', BCD1: 2 },
        { ...MULTIPLE_ANALYTICS[2], period: '3rd Jan 2020', BCD1: 5 },
      ]),
    );
  });

  it('where is processed before remaining fields', () => {
    const transform = buildTransform([
      {
        transform: 'insertColumns',
        where: '=exists($BCD1)',
        columns: {
          newVal: '=$BCD1 * 2', // This would fail on rows where BCD1 doesn't exist
        },
      },
    ]);
    expect(transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows(
        [
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
        ],
        ['period', 'organisationUnit', 'BCD1', 'BCD2', 'newVal'],
      ),
    );
  });
});
