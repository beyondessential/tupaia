/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { arrayToAnalytics } from '@tupaia/data-broker';
import { layerYearOnYear } from '../../../apiV1/utils/layerYearOnYear';

describe('layerYearOnYear()', () => {
  it('layers the years on previous years', () => {
    //   'YYYYMMDD'
    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 2],
      ['BCD1', 'TO', '20170101', 3],
      ['BCD1', 'TO', '20170102', 4],
    ]);
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '20200101', 1],
      ['BCD1', 'TO', '20200102', 2],
      ['BCD1_3_yr_ago', 'TO', '20200101', 3],
      ['BCD1_3_yr_ago', 'TO', '20200102', 4], // this is folded into latest year's data
    ]);
    expect(layerYearOnYear(analytics)).toStrictEqual(expected);
  });

  it('it works with different period types', () => {
    //  (!) When testing iso weeks, be aware that iso weeks in years differ. eg. iso week 1 in 2019 begins on dec 31, iso week 1 in 2021 begins on jan 4. See comparision with these two resources. https://www.epochconverter.com/weeks/2019 and https://www.epochconverter.com/weeks/2021

    const analytics = arrayToAnalytics([
      ['BCD1', 'TO', '2021W10', 1],
      ['BCD1', 'TO', '2021W11', 2],
      ['BCD1', 'TO', '2019W10', 3],
      ['BCD1', 'TO', '2019W11', 4],
    ]);
    const expected = arrayToAnalytics([
      ['BCD1', 'TO', '2021W10', 1],
      ['BCD1', 'TO', '2021W11', 2],
      ['BCD1_2_yr_ago', 'TO', '2021W09', 3],
      ['BCD1_2_yr_ago', 'TO', '2021W10', 4], // this is folded into latest year's data
    ]);
    expect(layerYearOnYear(analytics)).toStrictEqual(expected);
  });

  it('it can handle empty input', () => {
    //   'YYYYW01' eg
    const analytics = arrayToAnalytics([]);
    const expected = arrayToAnalytics([]);
    expect(layerYearOnYear(analytics)).toStrictEqual(expected);
  });
});
