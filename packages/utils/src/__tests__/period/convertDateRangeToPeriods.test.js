import moment from 'moment';

import { convertDateRangeToPeriods } from '../../period/convertDateRangeToPeriods';

describe('convertDateRangeToPeriods', () => {
  const testData = [
    [
      'should convert a date range within a single month',
      ['20180205', '20180212'],
      [
        '20180205',
        '20180206',
        '20180207',
        '20180208',
        '20180209',
        '20180210',
        '20180211',
        '20180212',
      ],
    ],
    [
      'should convert a date range in 2 consecutive months',
      ['20180528', '20180602'],
      ['20180528', '20180529', '20180530', '20180531', '20180601', '20180602'],
    ],
    [
      'should convert a date range in a 4 month time window',
      ['20180227', '20180602'],
      ['20180227', '20180228', '201803', '201804', '201805', '20180601', '20180602'],
    ],
    [
      'should convert a date range in a two-year time window',
      ['20161029', '20170202'],
      ['20161029', '20161030', '20161031', '201611', '201612', '201701', '20170201', '20170202'],
    ],
    [
      'should convert a date range in a multi-year time window',
      ['20161029', '20180202'],
      [
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
      ],
    ],
    ['should convert a single day into a period', ['20161029', '20161029'], ['20161029']],
    [
      'should handle February 29 in a leap year',
      ['20160227', '20160301'],
      ['20160227', '20160228', '20160229', '20160301'],
    ],
    [
      'should convert first of month to entire month',
      ['20160201', '20160401'],
      ['201602', '201603', '20160401'],
    ],
    ['should handle last day of month', ['20160701', '20160831'], ['201607', '201608']],
  ];

  describe('handle format yyyymmdd', () => {
    it.each(testData)('%s', (_, [startDate, endDate], expected) => {
      const startMoment = moment.utc(startDate);
      const endMoment = moment.utc(endDate);

      expect(convertDateRangeToPeriods(startMoment, endMoment)).toStrictEqual(expected);
    });
  });

  describe('handle format YYYY-MM-DD', () => {
    function changeFormat(date) {
      const newDate = moment(date).format('YYYY-MM-DD');
      return newDate;
    }

    it.each(testData)('%s', (_, [startDate, endDate], expected) => {
      const startMoment = moment.utc(changeFormat(startDate));
      const endMoment = moment.utc(changeFormat(endDate));

      expect(convertDateRangeToPeriods(startMoment, endMoment)).toStrictEqual(expected);
    });
  });
});
