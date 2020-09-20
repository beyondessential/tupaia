/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

import { convertDateRangeToPeriods } from '../../period/convertDateRangeToPeriods';

// TODO: Convert mocha to jest
/**
 * Skip for now.
 *
 * Reason: If using jest only, it couldn't check the order of the result array as
 * chai does - expect(periods).to.have.ordered.members([...])
 * jest didn't support checking the order. (We could write a matcher to solve this)
 */

describe.skip('convertDateRangeToPeriods', () => {
  it('should convert a date range within a single month', () => {
    const startDate = moment.utc('20180205');
    const endDate = moment.utc('20180212');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining([
      '20180205',
      '20180206',
      '20180207',
      '20180208',
      '20180209',
      '20180210',
      '20180211',
      '20180212',
    ]));
  });

  it('should convert a date range in 2 consecutive months', () => {
    const startDate = moment.utc('20180528');
    const endDate = moment.utc('20180602');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining([
      '20180528',
      '20180529',
      '20180530',
      '20180531',
      '20180601',
      '20180602',
    ]));
  });

  it('should convert a date range in a 4 month time window', () => {
    const startDate = moment.utc('20180227');
    const endDate = moment.utc('20180602');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining([
      '20180227',
      '20180228',
      '201803',
      '201804',
      '201805',
      '20180601',
      '20180602',
    ]));
  });

  it('should convert a date range in a two-year time window', () => {
    const startDate = moment.utc('20161029');
    const endDate = moment.utc('20170202');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining([
      '20161029',
      '20161030',
      '20161031',
      '201611',
      '201612',
      '201701',
      '20170201',
      '20170202',
    ]));
  });

  it('should convert a date range in a multi-year time window', () => {
    const startDate = moment.utc('20161029');
    const endDate = moment.utc('20180202');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining([
      '20161029',
      '20161030',
      '20161031',
      '201611',
      '201612',
      '201701',
      '201702',
      '201703',
      '201704',
      '201705',
      '201706',
      '201707',
      '201708',
      '201709',
      '201710',
      '201711',
      '201712',
      '201801',
      '20180201',
      '20180202',
    ]));
  });

  it('should convert a single day into a period', () => {
    const startDate = moment.utc('20161029');
    const endDate = moment.utc('20161029');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining(['20161029']));
  });

  it('should handle February 29 in a leap year', () => {
    const startDate = moment.utc('20160227');
    const endDate = moment.utc('20160301');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining(['20160227', '20160228', '20160229', '20160301']));
  });

  it('should convert first of month to entire month', () => {
    const startDate = moment.utc('20160201');
    const endDate = moment.utc('20160401');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining(['201602', '201603', '20160401']));
  });

  it('should handle last day of month', () => {
    const startDate = moment.utc('20160701');
    const endDate = moment.utc('20160831');

    const periods = convertDateRangeToPeriods(startDate, endDate);
    expect(periods).toEqual(expect.arrayContaining(['201607', '201608']));
  });
});
