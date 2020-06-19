/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { sumPerOrgGroup } from '../../../analytics/aggregateAnalytics/aggregations';

const orgUnitMap = {
  org1: { code: 'parent1', name: 'Parent 1' },
  org2: { code: 'parent2', name: 'Parent 2' },
  org3: { code: 'parent1', name: 'Parent 1' },
};

const BASE_TEST_ANALYTICS = [
  { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
  { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
  { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
];

describe('sumPerOrgGroup()', () => {
  it('should do nothing without orgUnitMap', () => {
    expect(sumPerOrgGroup(BASE_TEST_ANALYTICS, {})).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
      { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
      { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
    ]);
  });

  it('should sum using orgUnitMap', () => {
    expect(sumPerOrgGroup(BASE_TEST_ANALYTICS, { orgUnitMap })).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 4 },
      { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 2 },
    ]);
  });

  it('should sum using incomplete orgUnitMap', () => {
    const testAnalytics = [
      ...BASE_TEST_ANALYTICS,
      { dataElement: 'element1', organisationUnit: 'org4', period: '20200103', value: 4 },
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200103', value: 5 },
    ];
    expect(sumPerOrgGroup(testAnalytics, { orgUnitMap })).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 9 },
      { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 2 },
      { dataElement: 'element1', organisationUnit: 'org4', period: '20200103', value: 4 },
    ]);
  });

  it('should not sum across dataElements', () => {
    const testAnalytics = [
      { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
      { dataElement: 'element2', organisationUnit: 'org2', period: '20200102', value: 2 },
      { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
      { dataElement: 'element2', organisationUnit: 'org3', period: '20200103', value: 4 },
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200103', value: 5 },
    ];
    expect(sumPerOrgGroup(testAnalytics, { orgUnitMap })).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 9 },
      { dataElement: 'element2', organisationUnit: 'parent1', period: '20200103', value: 4 },
      { dataElement: 'element2', organisationUnit: 'parent2', period: '20200102', value: 2 },
    ]);
  });

  it('should use valueToMatch', () => {
    const testAnalytics = [
      { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 'Yes' },
      { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 'No' },
      { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 'Yes' },
    ];
    expect(
      sumPerOrgGroup(testAnalytics, { orgUnitMap, valueToMatch: 'Yes' }),
    ).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 2 },
      { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 0 },
    ]);
  });

  it('should use valueToMatch any key (*)', () => {
    const testAnalytics = [
      { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: null },
      { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 'No' },
      { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: false },
    ];
    expect(
      sumPerOrgGroup(testAnalytics, { orgUnitMap, valueToMatch: '*' }),
    ).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 2 },
      { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 1 },
    ]);
  });
});
