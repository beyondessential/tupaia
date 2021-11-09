/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  MULTIPLE_ANALYTICS,
  MERGEABLE_ANALYTICS,
  MULTIPLE_MERGEABLE_ANALYTICS,
  SINGLE_ANALYTIC,
  SINGLE_EVENT,
  MULTIPLE_ANALYTICS_SUMMARY_BINARY
} from './transform.fixtures';
import { buildTransform } from '../../../reportBuilder/transform';

describe('aliases', () => {
  it('keyValueByDataElementName', () => {
    const transform = buildTransform(['keyValueByDataElementName']);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'TO', BCD1: 4 },
      { period: '20200102', organisationUnit: 'TO', BCD1: 2 },
      { period: '20200103', organisationUnit: 'TO', BCD1: 5 },
    ]);
  });

  it('keyValueByOrgUnit', () => {
    const transform = buildTransform(['keyValueByOrgUnit']);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { period: '20200101', TO: 4, dataElement: 'BCD1' },
      { period: '20200102', TO: 2, dataElement: 'BCD1' },
      { period: '20200103', TO: 5, dataElement: 'BCD1' },
    ]);
  });

  it('keyValueByPeriod', () => {
    const transform = buildTransform(['keyValueByPeriod']);
    expect(transform(MULTIPLE_ANALYTICS)).toEqual([
      { '20200101': 4, organisationUnit: 'TO', dataElement: 'BCD1' },
      { '20200102': 2, organisationUnit: 'TO', dataElement: 'BCD1' },
      { '20200103': 5, organisationUnit: 'TO', dataElement: 'BCD1' },
    ]);
  });

  it('mostRecentValuePerOrgUnit', () => {
    const transform = buildTransform(['mostRecentValuePerOrgUnit']);
    expect(transform(MERGEABLE_ANALYTICS)).toEqual([
      { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 0 },
      { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
    ]);
  });

  it('firstValuePerPeriodPerOrgUnit', () => {
    const transform = buildTransform(['firstValuePerPeriodPerOrgUnit']);
    expect(transform(MULTIPLE_MERGEABLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'TO', BCD1: 4, BCD2: 11 },
      { period: '20200102', organisationUnit: 'TO', BCD1: 2, BCD2: 1 },
      { period: '20200103', organisationUnit: 'TO', BCD1: 5, BCD2: 0 },
      { period: '20200101', organisationUnit: 'PG', BCD1: 7, BCD2: 13 },
      { period: '20200102', organisationUnit: 'PG', BCD1: 8, BCD2: 99 },
      { period: '20200103', organisationUnit: 'PG', BCD1: 2, BCD2: -1 },
    ]);
  });

  it('lastValuePerPeriodPerOrgUnit', () => {
    const transform = buildTransform(['lastValuePerPeriodPerOrgUnit']);
    expect(transform(MULTIPLE_MERGEABLE_ANALYTICS)).toEqual([
      { period: '20200101', organisationUnit: 'TO', BCD1: 7, BCD2: 4 },
      { period: '20200102', organisationUnit: 'TO', BCD1: 12, BCD2: 18 },
      { period: '20200103', organisationUnit: 'TO', BCD1: 23, BCD2: 9 },
      { period: '20200101', organisationUnit: 'PG', BCD1: 17, BCD2: 23 },
      { period: '20200102', organisationUnit: 'PG', BCD1: 4, BCD2: -4 },
      { period: '20200103', organisationUnit: 'PG', BCD1: 1, BCD2: 12 },
    ]);
  });

  it('convertPeriodToWeek', () => {
    const transform = buildTransform(['convertPeriodToWeek']);
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ ...SINGLE_ANALYTIC[0], period: '2020W01' }]);
  });

  it('convertEventDateToWeek', () => {
    const transform = buildTransform(['convertEventDateToWeek']);
    expect(transform(SINGLE_EVENT)).toEqual([{ ...SINGLE_EVENT[0], period: '2020W01' }]);
  });

  it('insertSummaryRowAndColumn', () => {
    const transform = buildTransform(['insertSummaryRowAndColumn']);
    expect(transform(MULTIPLE_ANALYTICS_SUMMARY_BINARY)).toEqual([
      { summaryColumn: '75.0%', dataElement: 'Male condoms', TO: 'N', FJ: 'N', NR: 'Y', KI: 'N' },
      { summaryColumn: '25.0%', dataElement: 'Female condoms', TO: 'N', FJ: 'Y', NR: 'Y', KI: 'Y' },
      { summaryColumn: '0.0%', dataElement: 'Injectable contraceptives', TO: 'Y', FJ: 'Y', NR: undefined, KI: undefined },
      { TO: '66.7%', FJ: '33.3%', NR: '50.0%', KI: '0.0%' },
    ]);
  it('insertNumberOfFacilitiesColumn', () => {
    const transform = buildTransform(['insertNumberOfFacilitiesColumn'], {
      facilityCountByOrgUnit: { TO: 14 },
    });
    expect(transform(SINGLE_ANALYTIC)).toEqual([{ ...SINGLE_ANALYTIC[0], numberOfFacilities: 14 }]);
  });
});
