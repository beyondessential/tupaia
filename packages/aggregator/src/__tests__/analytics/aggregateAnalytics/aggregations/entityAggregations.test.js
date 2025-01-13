import {
  sumPerOrgGroup,
  sumPerPeriodPerOrgGroup,
  countPerOrgGroup,
} from '../../../../analytics/aggregateAnalytics/aggregations';

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

describe('entityAggregations', () => {
  describe('sumPerOrgGroup()', () => {
    it('should do nothing without orgUnitMap', () => {
      expect(sumPerOrgGroup(BASE_TEST_ANALYTICS, {})).toIncludeSameMembers([
        { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
      ]);
    });

    it('should sum using orgUnitMap', () => {
      expect(sumPerOrgGroup(BASE_TEST_ANALYTICS, { orgUnitMap })).toIncludeSameMembers([
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
      expect(sumPerOrgGroup(testAnalytics, { orgUnitMap })).toIncludeSameMembers([
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
      expect(sumPerOrgGroup(testAnalytics, { orgUnitMap })).toIncludeSameMembers([
        { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 9 },
        { dataElement: 'element2', organisationUnit: 'parent1', period: '20200103', value: 4 },
        { dataElement: 'element2', organisationUnit: 'parent2', period: '20200102', value: 2 },
      ]);
    });

    it('should use conditions with sum', () => {
      const testAnalytics = [
        { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 2 },
      ];
      expect(
        sumPerOrgGroup(testAnalytics, { orgUnitMap, condition: { operator: '=', value: 2 } }),
      ).toIncludeSameMembers([
        { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 4 },
        { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 0 },
      ]);
    });
  });

  describe('sumPerPeriodPerOrgGroup()', () => {
    it('should do nothing without orgUnitMap', () => {
      expect(sumPerPeriodPerOrgGroup(BASE_TEST_ANALYTICS, {})).toIncludeSameMembers([
        { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
      ]);
    });

    it('should sum per period per org group', () => {
      const testAnalytics = [
        { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 1 },
        { dataElement: 'element2', organisationUnit: 'org2', period: '20200102', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 3 },
        { dataElement: 'element2', organisationUnit: 'org3', period: '20200103', value: 4 },
        { dataElement: 'element1', organisationUnit: 'parent1', period: '20200103', value: 5 },
      ];
      expect(sumPerPeriodPerOrgGroup(testAnalytics, { orgUnitMap })).toIncludeSameMembers([
        { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 1 },
        { dataElement: 'element1', organisationUnit: 'parent1', period: '20200103', value: 8 },
        { dataElement: 'element2', organisationUnit: 'parent1', period: '20200103', value: 4 },
        { dataElement: 'element2', organisationUnit: 'parent2', period: '20200102', value: 2 },
      ]);
    });
  });

  describe('countPerOrgGroup()', () => {
    it('should use conditions to count', () => {
      const testAnalytics = [
        { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 'Yes' },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 'No' },
        { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 'Yes' },
      ];
      expect(
        countPerOrgGroup(testAnalytics, {
          orgUnitMap,
          condition: { operator: '=', value: 'Yes' },
        }),
      ).toIncludeSameMembers([
        { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 2 },
        { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 0 },
      ]);
    });

    it('should use more complex conditions to count', () => {
      const testAnalytics = [
        { dataElement: 'element1', organisationUnit: 'org1', period: '20200101', value: 20 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20200102', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org3', period: '20200103', value: 5 },
      ];
      expect(
        countPerOrgGroup(testAnalytics, { orgUnitMap, condition: { operator: '>', value: 3 } }),
      ).toIncludeSameMembers([
        { dataElement: 'element1', organisationUnit: 'parent1', period: '20200101', value: 2 },
        { dataElement: 'element1', organisationUnit: 'parent2', period: '20200102', value: 0 },
      ]);
    });
  });
});
