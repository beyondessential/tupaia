/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';

import { sumAcrossPeriods } from '../../../../analytics/aggregateAnalytics/aggregations/sumAcrossPeriods';

describe('sumAcrossPeriods', () => {
  const arrayToAnalytics = arrayAnalytics =>
    arrayAnalytics.map(([dataElement, organisationUnit, period, value]) => ({
      dataElement,
      organisationUnit,
      period,
      value,
    }));

  const ANALYTICS = arrayToAnalytics([
    // BCD01 - TO
    ['BCD01', 'TO', '201601', 1],
    ['BCD01', 'TO', '201801', 0.1],
    ['BCD01', 'TO', '201901', 0.01],
    // BCD01 - PG
    ['BCD01', 'PG', '201601', 2],
    ['BCD01', 'PG', '201801', 0.2],
    ['BCD01', 'PG', '201901', 0.02],
    // BCD02 - TO
    ['BCD02', 'TO', '201801', 4],
    ['BCD02', 'TO', '202001', 0.44],
  ]);

  const CURRENT_DATE_STUB = '2020-01-31T00:00:00Z';
  const CURRENT_PERIOD_STUBS = {
    DAY: '20200131',
    YEAR: '2020',
  };

  let clock;

  before(() => {
    clock = sinon.useFakeTimers({ now: new Date(CURRENT_DATE_STUB) });
  });

  after(() => {
    clock.restore();
  });

  it('single analytic', () => {
    expect(sumAcrossPeriods([ANALYTICS[0]])).to.have.same.deep.members([ANALYTICS[0]]);
  });

  it('multiple analytics', () => {
    expect(sumAcrossPeriods(ANALYTICS)).to.have.same.deep.members(
      arrayToAnalytics([
        ['BCD01', 'TO', '201601', 1.11],
        ['BCD01', 'PG', '201601', 2.22],
        ['BCD02', 'TO', '201801', 4.44],
      ]),
    );
  });

  describe('periodOptions', () => {
    describe('periodType', () => {
      it('does nothing if not set', () => {
        expect(sumAcrossPeriods(ANALYTICS, { periodOptions: {} })).to.have.same.deep.members(
          arrayToAnalytics([
            ['BCD01', 'TO', '201601', 1.11],
            ['BCD01', 'PG', '201601', 2.22],
            ['BCD02', 'TO', '201801', 4.44],
          ]),
        );
      });

      it('converts periods to the specified type', () => {
        expect(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { periodType: 'YEAR' } }),
        ).to.have.same.deep.members(
          arrayToAnalytics([
            ['BCD01', 'TO', '2016', 1.11],
            ['BCD01', 'PG', '2016', 2.22],
            ['BCD02', 'TO', '2018', 4.44],
          ]),
        );
      });
    });

    describe('useCurrent', () => {
      it('does nothing if not set', () => {
        expect(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { useCurrent: false } }),
        ).to.have.same.deep.members(
          arrayToAnalytics([
            ['BCD01', 'TO', '201601', 1.11],
            ['BCD01', 'PG', '201601', 2.22],
            ['BCD02', 'TO', '201801', 4.44],
          ]),
        );
      });

      it('uses the current period of the specified type', () => {
        expect(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { useCurrent: true, periodType: 'YEAR' } }),
        ).to.have.same.deep.members(
          arrayToAnalytics([
            ['BCD01', 'TO', CURRENT_PERIOD_STUBS.YEAR, 1.11],
            ['BCD01', 'PG', CURRENT_PERIOD_STUBS.YEAR, 2.22],
            ['BCD02', 'TO', CURRENT_PERIOD_STUBS.YEAR, 4.44],
          ]),
        );
      });

      it('uses DAY period type by default', () => {
        expect(
          sumAcrossPeriods(ANALYTICS, { periodOptions: { useCurrent: true } }),
        ).to.have.same.deep.members(
          arrayToAnalytics([
            ['BCD01', 'TO', CURRENT_PERIOD_STUBS.DAY, 1.11],
            ['BCD01', 'PG', CURRENT_PERIOD_STUBS.DAY, 2.22],
            ['BCD02', 'TO', CURRENT_PERIOD_STUBS.DAY, 4.44],
          ]),
        );
      });
    });
  });
});
