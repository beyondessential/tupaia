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
    const getExpectedArray = (aggregationPeriod, defaultVariables, startDate, endDate) => {
      const startPeriod = convertToPeriod(startDate, aggregationPeriod);
      // const endPeriod = getCurrentPeriod(aggregationPeriod);
      const endPeriod = convertToPeriod(endDate, aggregationPeriod);
      const periods = getPeriodsInRange(startPeriod, endPeriod);
      return periods.map(period => ({
        ...defaultVariables,
        period,
      }));
    };

    it('filling continuous values till current period', () => {
      const defaultVariables = { dataElement: 'element1', organisationUnit: 'org1' };

      const aggregationPeriod = 'DAY';
      const testAnalytics = [
        { ...defaultVariables, value: 11, period: '20210101' },
        { ...defaultVariables, value: 1, period: '20210104' },
      ];
      const aggregationConfig = {
        fillEmptyPeriodsWith: 'previous',
      };

      expect(
        getFinalValuePerPeriod(testAnalytics, aggregationConfig, aggregationPeriod),
      ).toStrictEqual([
        ...getExpectedArray(
          aggregationPeriod,
          { ...defaultVariables, value: 11 },
          '20210101',
          '20210103',
        ),
        ...getExpectedArray(
          aggregationPeriod,
          { ...defaultVariables, value: 1 },
          '20210104',
          getCurrentPeriod('DAY'),
        ),
      ]);
    });

    it('filling continuous values for two data elements', () => {
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
        ...getExpectedArray(
          aggregationPeriod,
          defaultVariablesForOrg1,
          startDateOrg1,
          getCurrentPeriod('DAY'),
        ),
        ...getExpectedArray(
          aggregationPeriod,
          defaultVariablesForOrg2,
          startDateOrg2,
          getCurrentPeriod('DAY'),
        ),
      ]);
    });

    it(`filling preset value by 'fillEmptyPeriodsWith'`, () => {
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
        // org2
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210105', value: 1 },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210106', value: 'test' },
        { dataElement: 'element1', organisationUnit: 'org2', period: '20210107', value: 3 },
      ]);
    });
  });
});
