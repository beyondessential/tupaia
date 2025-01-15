import { arrayToAnalytics } from '..';

describe('utils', () => {
  describe('arrayToAnalytic', () => {
    it('converts an array to an analytic', () => {
      expect(
        arrayToAnalytics([
          ['BCD1', 'TO', '20190101', 10],
          ['BCD2', 'PG', '20200101', 20],
        ]),
      ).toStrictEqual([
        { dataElement: 'BCD1', organisationUnit: 'TO', period: '20190101', value: 10 },
        { dataElement: 'BCD2', organisationUnit: 'PG', period: '20200101', value: 20 },
      ]);
    });
  });
});
