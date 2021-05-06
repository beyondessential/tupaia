import { getPeriodsInRange, getCurrentPeriod, convertToPeriod } from '@tupaia/utils';
import { getFinalValuePerPeriod } from '../../../../analytics/aggregateAnalytics/aggregations';

describe('getFinalValuePerPeriod()', () => {
  describe('getDistinctValues()', () => {
    it('change period to WEEK', () => {
      const testAnalytics = [
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210101', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210102', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210108', value: 3 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210109', value: 3 },
      ];
      const aggregationPeriod = 'WEEK';
      expect(getFinalValuePerPeriod(testAnalytics, null, aggregationPeriod)).toStrictEqual([
        { dataElement: 'element1', organisationUnit: 'org1', period: '2020W53', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org1', period: '2021W01', value: 3 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '2020W53', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '2021W01', value: 3 },
      ]);
    });

    it('get final value', () => {
      const testAnalytics = [
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210101', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210102', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210108', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210109', value: 3 },
      ];
      const aggregationPeriod = 'WEEK';
      expect(getFinalValuePerPeriod(testAnalytics, null, aggregationPeriod)).toStrictEqual([
        { dataElement: 'element1', organisationUnit: 'org1', period: '2020W53', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '2021W01', value: 3 },
      ]);
    });
  });

  describe('getFilledValues()', () => {
    const getExpectedArray = (startDate, aggregationPeriod, defaultVariables) => {
      const startPeriod = convertToPeriod(startDate, aggregationPeriod);
      const endPeriod = getCurrentPeriod(aggregationPeriod);
      const periods = getPeriodsInRange(startPeriod, endPeriod);
      return periods.map(period => ({
        ...defaultVariables,
        period,
      }));
    };

    it('Filling continuous values', () => {
      const defaultVariables = { dataElement: 'element1', organisationUnit: 'org1', value: 1 };

      const startDate = '20210101';
      const aggregationPeriod = 'WEEK';
      const testAnalytics = [{ ...defaultVariables, period: startDate }];
      const aggregationConfig = {
        fillEmptyPeriodsWith: 'previous',
      };

      expect(
        getFinalValuePerPeriod(testAnalytics, aggregationConfig, aggregationPeriod),
      ).toStrictEqual(getExpectedArray(startDate, aggregationPeriod, defaultVariables));
    });

    it('Filling continuous values for two elements', () => {
      const defaultVariablesForOrg1 = {
        dataElement: 'element1',
        organisationUnit: 'org1',
        value: 1,
      };

      const defaultVariablesForOrg2 = {
        dataElement: 'element1',
        organisationUnit: 'org2',
        value: 2,
      };

      const startDateOrg1 = '20210101';
      const startDateOrg2 = '20210303';
      const aggregationPeriod = 'WEEK';
      const testAnalytics = [
        { ...defaultVariablesForOrg1, period: startDateOrg1 },
        { ...defaultVariablesForOrg2, period: startDateOrg2 },
      ];
      const aggregationConfig = {
        fillEmptyPeriodsWith: 'previous',
      };

      expect(
        getFinalValuePerPeriod(testAnalytics, aggregationConfig, aggregationPeriod),
      ).toStrictEqual([
        ...getExpectedArray(startDateOrg1, aggregationPeriod, defaultVariablesForOrg1),
        ...getExpectedArray(startDateOrg2, aggregationPeriod, defaultVariablesForOrg2),
      ]);
    });

    it(`Filling preset value by 'fillEmptyPeriodsWith'`, () => {
      const testAnalytics = [
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210101', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210104', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210105', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210107', value: 3 },
      ];
      const aggregationPeriod = 'DAY';
      const aggregationConfig = {
        fillEmptyPeriodsWith: 'test',
      };
      expect(
        getFinalValuePerPeriod(testAnalytics, aggregationConfig, aggregationPeriod),
      ).toStrictEqual([
        // org1
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210101', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210102', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210103', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210104', value: 2 },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210105', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210106', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org1', period: '20210107', value: 'test' },
        // org2
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210101', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210102', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210103', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210104', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210105', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210106', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210107', value: 3 },
      ]);
    });
  });
});
