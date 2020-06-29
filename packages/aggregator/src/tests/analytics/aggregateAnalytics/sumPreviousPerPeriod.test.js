/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { PERIOD_TYPES } from '@tupaia/utils';
import { sumPreviousPerPeriod } from '../../../analytics/aggregateAnalytics/aggregations';

const DAY = PERIOD_TYPES.DAY;
const YEAR = PERIOD_TYPES.YEAR;

describe('sumPreviousPerPeriod()', () => {
  it('should sum accross periods', () => {
    const testAnalytics = [
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
    ];
    expect(sumPreviousPerPeriod(testAnalytics, {}, DAY)).to.have.same.deep.members([
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 3 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 6 },
    ]);
  });

  it('should combine by org unit and data element', () => {
    const testAnalytics = [
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      { dataElement: 2, organisationUnit: 1, period: '20200101', value: 2 },
      { dataElement: 1, organisationUnit: 2, period: '20200101', value: 3 },
      { dataElement: 2, organisationUnit: 2, period: '20200101', value: 4 },
      //
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 5 },
      { dataElement: 2, organisationUnit: 1, period: '20200102', value: 6 },
      { dataElement: 1, organisationUnit: 2, period: '20200102', value: 7 },
      { dataElement: 2, organisationUnit: 2, period: '20200102', value: 8 },
    ];
    expect(sumPreviousPerPeriod(testAnalytics, {}, DAY)).to.have.same.deep.members([
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      { dataElement: 2, organisationUnit: 1, period: '20200101', value: 2 },
      { dataElement: 1, organisationUnit: 2, period: '20200101', value: 3 },
      { dataElement: 2, organisationUnit: 2, period: '20200101', value: 4 },
      //
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 6 },
      { dataElement: 2, organisationUnit: 1, period: '20200102', value: 8 },
      { dataElement: 1, organisationUnit: 2, period: '20200102', value: 10 },
      { dataElement: 2, organisationUnit: 2, period: '20200102', value: 12 },
    ]);
  });

  it('should sum with missing analytics', () => {
    const testAnalytics = [
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      //{ dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
    ];
    expect(sumPreviousPerPeriod(testAnalytics, {}, DAY)).to.have.same.deep.members([
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 1 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 4 },
    ]);
  });

  it('should sum with no analytics', () => {
    const testAnalytics = [];
    expect(sumPreviousPerPeriod(testAnalytics, {}, DAY)).to.have.same.deep.members([]);
  });

  it('should only return results within requestedPeriod if oldest request period > oldest data', () => {
    const testAnalytics = [
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
    ];
    expect(
      sumPreviousPerPeriod(testAnalytics, { requestedPeriod: '20200102;20200103;20200104' }, DAY),
    ).to.have.same.deep.members([
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 3 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 6 },
    ]);
  });

  it('should only return results within requestedPeriod if latest request period < newest data', () => {
    const testAnalytics = [
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
    ];
    expect(
      sumPreviousPerPeriod(testAnalytics, { requestedPeriod: '20191231;20200101;20200102' }, DAY),
    ).to.have.same.deep.members([
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 3 },
    ]);
  });

  it('should work if there is no data for the first period', () => {
    const testAnalytics = [
      { dataElement: 1, organisationUnit: 1, period: '20200101', value: 1 },
      //{ dataElement: 1, organisationUnit: 1, period: '20200102', value: 2 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 3 },
    ];
    expect(
      sumPreviousPerPeriod(testAnalytics, { requestedPeriod: '20200102;20200103' }, DAY),
    ).to.have.same.deep.members([
      { dataElement: 1, organisationUnit: 1, period: '20200102', value: 1 },
      { dataElement: 1, organisationUnit: 1, period: '20200103', value: 4 },
    ]);
  });

  // It won't work with non numeric periods. eg: 2020W2
  it('should do everything with a different period type', () => {
    const testAnalytics = [
      { dataElement: 1, organisationUnit: 1, period: '2017', value: 1 },
      { dataElement: 2, organisationUnit: 1, period: '2017', value: 2 },
      //
      { dataElement: 1, organisationUnit: 1, period: '2018', value: 3 },
      { dataElement: 1, organisationUnit: 2, period: '2018', value: 4 },
      //
      { dataElement: 1, organisationUnit: 1, period: '2019', value: 5 },
      //
      { dataElement: 1, organisationUnit: 1, period: '2020', value: 6 },
      { dataElement: 1, organisationUnit: 2, period: '2020', value: 7 },
      { dataElement: 2, organisationUnit: 1, period: '2020', value: 8 },
    ];
    expect(
      sumPreviousPerPeriod(testAnalytics, { requestedPeriod: '2019;2020;2021;2022' }, YEAR),
    ).to.have.same.deep.members([
      { dataElement: 1, organisationUnit: 1, period: '2019', value: 9 },
      { dataElement: 2, organisationUnit: 1, period: '2019', value: 2 },
      { dataElement: 1, organisationUnit: 2, period: '2019', value: 4 },
      //
      { dataElement: 1, organisationUnit: 1, period: '2020', value: 15 },
      { dataElement: 2, organisationUnit: 1, period: '2020', value: 10 },
      { dataElement: 1, organisationUnit: 2, period: '2020', value: 11 },
    ]);
  });
});
