/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { sumPerOrgGroup } from '../../../analytics/aggregateAnalytics/aggregations';

const orgUnitMap = {
  org1: 'parent1',
  org2: 'parent2',
  org3: 'parent1',
};

describe('sumPerOrgGroup()', () => {
  it('should do nothing without orgUnitMap', () => {
    const testAnalytics = [
      { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
      { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
      { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
    ];
    expect(sumPerOrgGroup(testAnalytics, {})).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
      { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
      { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
    ]);
  });

  it('should sum using orgUnitMap', () => {
    const testAnalytics = [
      { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
      { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
      { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
    ];
    expect(sumPerOrgGroup(testAnalytics, { orgUnitMap })).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 4 },
      { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 2 },
    ]);
  });

  it('should sum using incomplete orgUnitMap', () => {
    const testAnalytics = [
      { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
      { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
      { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
      { dataElement: 'element1', organisationUnit: 'org4', period: '20200103', value: 4 },
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200103', value: 5 },
    ];
    expect(sumPerOrgGroup(testAnalytics, { orgUnitMap })).to.have.same.deep.members([
      { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 9 },
      { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 2 },
      { dataElement: 'element1', organisationUnit: 'org4', period: '20200103', value: 4 },
    ]);
  });
});
