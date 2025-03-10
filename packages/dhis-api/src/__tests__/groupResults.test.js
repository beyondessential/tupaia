/* eslint-disable camelcase */

import { PERIOD_TYPES } from '@tupaia/tsutils';
import { groupAnalyticsByPeriod, groupEventsByOrgUnit, groupEventsByPeriod } from '../groupResults';

const { DAY, WEEK, MONTH, YEAR } = PERIOD_TYPES;

describe('groupResults', () => {
  describe('groupAnalyticsByPeriod', () => {
    it('should return an empty object for no analytics', () => {
      expect(groupAnalyticsByPeriod()).toStrictEqual({});
      expect(groupAnalyticsByPeriod([])).toStrictEqual({});
    });

    it('should group analytics by year', () => {
      const y2017_a = { period: '20170101' };
      const y2017_b = { period: '20171231' };
      const y2018 = { period: '20180101' };

      expect(groupAnalyticsByPeriod([y2017_a, y2017_b, y2018], YEAR)).toStrictEqual({
        2017: [y2017_a, y2017_b],
        2018: [y2018],
      });
    });

    it('should group analytics by month', () => {
      const m201701_a = { period: '20170101' };
      const m201701_b = { period: '20170131' };
      const m201712 = { period: '20171231' };
      const m201801 = { period: '20180101' };

      expect(groupAnalyticsByPeriod([m201701_a, m201701_b, m201712, m201801], MONTH)).toStrictEqual(
        {
          201701: [m201701_a, m201701_b],
          201712: [m201712],
          201801: [m201801],
        },
      );
    });

    it('should group analytics by iso week', () => {
      const w2017W1_a = { period: '20170104' };
      const w2017W1_b = { period: '20170105' };
      const w2017W2 = { period: '20170109' };
      const w2018W1 = { period: '20180104' };

      expect(groupAnalyticsByPeriod([w2017W1_a, w2017W1_b, w2017W2, w2018W1], WEEK)).toStrictEqual({
        '2017W01': [w2017W1_a, w2017W1_b],
        '2017W02': [w2017W2],
        '2018W01': [w2018W1],
      });
    });

    it('should group analytics by day', () => {
      const d20170101_a = { period: '20170101' };
      const d20170101_b = { period: '20170101' };
      const d20170102 = { period: '20170102' };
      const d20171231 = { period: '20171231' };
      const d20180101 = { period: '20180101' };

      expect(
        groupAnalyticsByPeriod([d20170101_a, d20170101_b, d20170102, d20171231, d20180101], DAY),
      ).toStrictEqual({
        20170101: [d20170101_a, d20170101_b],
        20170102: [d20170102],
        20171231: [d20171231],
        20180101: [d20180101],
      });
    });
  });

  describe('groupEventsByPeriod()', () => {
    it('should return an empty object for no events', () => {
      expect(groupEventsByPeriod()).toStrictEqual({});
      expect(groupEventsByPeriod([])).toStrictEqual({});
    });

    it('should group events by year', () => {
      const y2017_a = { eventDate: '2017-01-01T00:00:00.000' };
      const y2017_b = { eventDate: '2017-12-31T00:00:00.000' };
      const y2018 = { eventDate: '2018-01-01T00:00:00.000' };

      expect(groupEventsByPeriod([y2017_a, y2017_b, y2018], YEAR)).toStrictEqual({
        2017: [y2017_a, y2017_b],
        2018: [y2018],
      });
    });

    it('should group events by month', () => {
      const m201701_a = { eventDate: '2017-01-01T00:00:00.000' };
      const m201701_b = { eventDate: '2017-01-31T00:00:00.000' };
      const m201712 = { eventDate: '2017-12-31T00:00:00.000' };
      const m201801 = { eventDate: '2018-01-01T00:00:00.000' };

      expect(groupEventsByPeriod([m201701_a, m201701_b, m201712, m201801], MONTH)).toStrictEqual({
        201701: [m201701_a, m201701_b],
        201712: [m201712],
        201801: [m201801],
      });
    });

    it('should group events by iso week', () => {
      const w2017W1_a = { eventDate: '2017-01-04T00:00:00.000' };
      const w2017W1_b = { eventDate: '2017-01-05T00:00:00.000' };
      const w2017W2 = { eventDate: '2017-01-09T00:00:00.000' };
      const w2018W1 = { eventDate: '2018-01-04T00:00:00.000' };

      expect(groupEventsByPeriod([w2017W1_a, w2017W1_b, w2017W2, w2018W1], WEEK)).toStrictEqual({
        '2017W01': [w2017W1_a, w2017W1_b],
        '2017W02': [w2017W2],
        '2018W01': [w2018W1],
      });
    });

    it('should group events by day', () => {
      const d20170101_a = { eventDate: '2017-01-01T00:00:00.000' };
      const d20170101_b = { eventDate: '2017-01-01T12:00:00.000' };
      const d20170102 = { eventDate: '2017-01-02T00:00:00.000' };
      const d20171231 = { eventDate: '2017-12-31T00:00:00.000' };
      const d20180101 = { eventDate: '2018-01-01T00:00:00.000' };

      expect(
        groupEventsByPeriod([d20170101_a, d20170101_b, d20170102, d20171231, d20180101], DAY),
      ).toStrictEqual({
        20170101: [d20170101_a, d20170101_b],
        20170102: [d20170102],
        20171231: [d20171231],
        20180101: [d20180101],
      });
    });
  });

  describe('groupEventsByOrgUnit()', () => {
    it('should return an empty object for no events', () => {
      expect(groupEventsByOrgUnit()).toStrictEqual({});
      expect(groupEventsByOrgUnit([])).toStrictEqual({});
    });

    it('should group events by org unit', () => {
      const nukunuku1 = { orgUnit: 'TO_Nukuhc', dataValues: { POP01: '1' } };
      const kolonga = { orgUnit: 'TO_KlongaHC', dataValues: { POP01: '2' } };
      const nukunuku2 = { orgUnit: 'TO_Nukuhc', dataValues: { POP01: '3' } };

      expect(groupEventsByOrgUnit([nukunuku1, kolonga, nukunuku2])).toStrictEqual({
        TO_Nukuhc: [nukunuku1, nukunuku2],
        TO_KlongaHC: [kolonga],
      });
    });
  });
});
