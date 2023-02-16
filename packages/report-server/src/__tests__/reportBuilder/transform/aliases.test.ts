/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  MERGEABLE_ANALYTICS,
  MULTIPLE_ANALYTICS,
  MULTIPLE_MERGEABLE_ANALYTICS,
  SINGLE_ANALYTIC,
  SINGLE_EVENT,
  TRANSFORMED_SUMMARY_BINARY,
  TRANSFORMED_SUMMARY_VARIOUS,
} from './transform.fixtures';
import { buildTestTransform } from '../testUtils';
import { TransformTable } from '../../../reportBuilder/transform';

describe('aliases', () => {
  it('keyValueByDataElementName', async () => {
    const transform = buildTestTransform(['keyValueByDataElementName']);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
      ]),
    );
  });

  it('keyValueByOrgUnit', async () => {
    const transform = buildTestTransform(['keyValueByOrgUnit']);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', dataElement: 'BCD1', TO: 4 },
        { period: '20200102', dataElement: 'BCD1', TO: 2 },
        { period: '20200103', dataElement: 'BCD1', TO: 5 },
      ]),
    );
  });

  it('keyValueByPeriod', async () => {
    const transform = buildTestTransform(['keyValueByPeriod']);
    expect(await transform(TransformTable.fromRows(MULTIPLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows(
        [
          { organisationUnit: 'TO', dataElement: 'BCD1', '20200101': 4 },
          { organisationUnit: 'TO', dataElement: 'BCD1', '20200102': 2 },
          { organisationUnit: 'TO', dataElement: 'BCD1', '20200103': 5 },
        ],
        ['organisationUnit', 'dataElement', '20200101', '20200102', '20200103'],
      ),
    );
  });

  it('mostRecentValuePerOrgUnit', async () => {
    const transform = buildTestTransform(['mostRecentValuePerOrgUnit']);
    expect(await transform(TransformTable.fromRows(MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 0 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
      ]),
    );
  });

  it('firstValuePerPeriodPerOrgUnit', async () => {
    const transform = buildTestTransform(['firstValuePerPeriodPerOrgUnit']);
    expect(await transform(TransformTable.fromRows(MULTIPLE_MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 4, BCD2: 11 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 2, BCD2: 1 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 0 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 7, BCD2: 13 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 8, BCD2: 99 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
      ]),
    );
  });

  it('lastValuePerPeriodPerOrgUnit', async () => {
    const transform = buildTestTransform(['lastValuePerPeriodPerOrgUnit']);
    expect(await transform(TransformTable.fromRows(MULTIPLE_MERGEABLE_ANALYTICS))).toStrictEqual(
      TransformTable.fromRows([
        { period: '20200101', organisationUnit: 'TO', BCD1: 7, BCD2: 4 },
        { period: '20200102', organisationUnit: 'TO', BCD1: 12, BCD2: 18 },
        { period: '20200103', organisationUnit: 'TO', BCD1: 23, BCD2: 9 },
        { period: '20200101', organisationUnit: 'PG', BCD1: 17, BCD2: 23 },
        { period: '20200102', organisationUnit: 'PG', BCD1: 4, BCD2: -4 },
        { period: '20200103', organisationUnit: 'PG', BCD1: 1, BCD2: 12 },
      ]),
    );
  });

  it('convertPeriodToWeek', async () => {
    const transform = buildTestTransform(['convertPeriodToWeek']);
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], period: '2020W01' }]),
    );
  });

  it('convertEventDateToWeek', async () => {
    const transform = buildTestTransform(['convertEventDateToWeek']);
    expect(await transform(TransformTable.fromRows(SINGLE_EVENT))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_EVENT[0], period: '2020W01' }]),
    );
  });

  it('insertNumberOfFacilitiesColumn', async () => {
    const transform = buildTestTransform(['insertNumberOfFacilitiesColumn'], {
      facilityCountByOrgUnit: { TO: 14 },
    });
    expect(await transform(TransformTable.fromRows(SINGLE_ANALYTIC))).toStrictEqual(
      TransformTable.fromRows([{ ...SINGLE_ANALYTIC[0], numberOfFacilities: 14 }]),
    );
  });
});

describe('insertSummaryRowAndColumn', () => {
  it('inserts a summary row and summary column', async () => {
    const transform = buildTestTransform(['insertSummaryRowAndColumn']);
    expect(await transform(TransformTable.fromRows(TRANSFORMED_SUMMARY_BINARY))).toStrictEqual(
      TransformTable.fromRows([
        { dataElement: 'Male condoms', TO: 'N', FJ: 'N', NR: 'Y', KI: 'N', summaryColumn: '75.0%' },
        {
          dataElement: 'Female condoms',
          TO: 'N',
          FJ: 'Y',
          NR: 'Y',
          KI: 'Y',
          summaryColumn: '25.0%',
        },
        {
          dataElement: 'Injectable contraceptives',
          TO: 'Y',
          FJ: 'Y',
          summaryColumn: '0.0%',
        },
        { TO: '66.7%', FJ: '33.3%', NR: '0.0%', KI: '50.0%' },
      ]),
    );
  });

  it('only summarises columns that have only Y | N | undefined values', async () => {
    const transform = buildTestTransform(['insertSummaryRowAndColumn']);
    expect(await transform(TransformTable.fromRows(TRANSFORMED_SUMMARY_VARIOUS))).toStrictEqual(
      TransformTable.fromRows([
        {
          dataElement: 'Male condoms',
          TO: 'Yes',
          FJ: 'N',
          NR: 'Y',
          KI: 'N',
          summaryColumn: '66.7%',
        },
        {
          dataElement: 'Female condoms',
          TO: 'N',
          FJ: 'Y',
          NR: 'Y',
          KI: 'Y',
          summaryColumn: '0.0%',
        },
        {
          dataElement: 'Injectable contraceptives',
          TO: 'Y',
          FJ: 'Y',
          summaryColumn: '0.0%',
        },
        { FJ: '33.3%', NR: '0.0%', KI: '50.0%' },
      ]),
    );
  });
});
