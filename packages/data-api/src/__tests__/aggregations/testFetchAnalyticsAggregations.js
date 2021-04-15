/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  BCD_RESPONSE_AUCKLAND,
  BCD_RESPONSE_WELLINGTON,
  CROP_RESPONSE_WELLINGTON_2019,
  CROP_RESPONSE_AUCKLAND_2019,
  CROP_RESPONSE_AUCKLAND_2020,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
  KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
  KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
  KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
  KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
  KITTY_RESPONSE_WELLINGTON_MORNING_20220608W23,
  KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
  KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23,
} from '../TupaiaDataApi.fixtures';

export const testFetchAnalyticsAggregations = assertCorrectResponse => () => {
  it('should not perform any aggregation is an unsupported aggregation is supplied', async () => {
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['KITTY_1', 'KITTY_2'],
        startDate: '2019-01-01',
        endDate: '2022-01-01',
        aggregations: [{ type: 'SUM' }],
      },
      [
        KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
        KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
        KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
        KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
        KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
      ],
    );
  });

  it('should not perform any aggregation if the supported aggregation is not the first aggregation', async () => {
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['KITTY_1', 'KITTY_2'],
        startDate: '2019-01-01',
        endDate: '2022-01-01',
        aggregations: [{ type: 'OFFSET_PERIOD' }, { type: 'FINAL_EACH_YEAR' }],
      },
      [
        KITTY_RESPONSE_WELLINGTON_MORNING_20210104W1,
        KITTY_RESPONSE_WELLINGTON_MIDDAY_20210104W1,
        KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210105W1,
        KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
        KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
      ],
    );
  });

  it('should return correct results when no start date or end date are specified', async () => {
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
        dataElementCodes: ['KITTY_1', 'KITTY_2'],
        aggregations: [{ type: 'FINAL_EACH_MONTH' }],
      },
      [
        KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
        KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
        KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        KITTY_RESPONSE_WELLINGTON_MORNING_20220608W23,
        KITTY_RESPONSE_AUCKLAND_MORNING_20220608W23,
      ],
    );
  });

  it('should return correct results when requested period does not land on period type boundary', async () => {
    await assertCorrectResponse(
      {
        organisationUnitCodes: ['NZ_WG'],
        dataElementCodes: ['KITTY_1', 'KITTY_2'],
        startDate: '2021-01-01',
        endDate: '2021-01-04',
        aggregations: [{ type: 'FINAL_EACH_WEEK' }],
      },
      [KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1],
    );
  });

  describe('FINAL_EACH_DAY', () => {
    it('should return correct results across a number of data_elements, entities, and periods', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
          startDate: '2019-01-01',
          endDate: '2022-01-01',
          aggregations: [{ type: 'FINAL_EACH_DAY' }],
        },
        [
          CROP_RESPONSE_AUCKLAND_2019,
          CROP_RESPONSE_WELLINGTON_2019,
          BCD_RESPONSE_AUCKLAND,
          BCD_RESPONSE_WELLINGTON,
          CROP_RESPONSE_AUCKLAND_2020,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210104W1,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210113W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ],
      );
    });
  });

  describe('FINAL_EACH_WEEK', () => {
    it('should return correct results across a number of data_elements, entities, and periods', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
          startDate: '2019-01-01',
          endDate: '2022-01-01',
          aggregations: [{ type: 'FINAL_EACH_WEEK' }],
        },
        [
          CROP_RESPONSE_AUCKLAND_2019,
          CROP_RESPONSE_WELLINGTON_2019,
          BCD_RESPONSE_AUCKLAND,
          BCD_RESPONSE_WELLINGTON,
          CROP_RESPONSE_AUCKLAND_2020,
          KITTY_RESPONSE_WELLINGTON_NIGHT_20210105W1,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210205W5,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ],
      );
    });
  });

  describe('FINAL_EACH_MONTH', () => {
    it('should return correct results across a number of data_elements, entities, and periods', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
          startDate: '2019-01-01',
          endDate: '2022-01-01',
          aggregations: [{ type: 'FINAL_EACH_MONTH' }],
        },
        [
          CROP_RESPONSE_AUCKLAND_2019,
          CROP_RESPONSE_WELLINGTON_2019,
          BCD_RESPONSE_AUCKLAND,
          BCD_RESPONSE_WELLINGTON,
          CROP_RESPONSE_AUCKLAND_2020,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210115W2,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ],
      );
    });
  });

  describe('FINAL_EACH_YEAR', () => {
    it('should return correct results across a number of data_elements, entities, and periods', async () => {
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
          startDate: '2019-01-01',
          endDate: '2022-01-01',
          aggregations: [{ type: 'FINAL_EACH_YEAR' }],
        },
        [
          CROP_RESPONSE_AUCKLAND_2019,
          CROP_RESPONSE_WELLINGTON_2019,
          BCD_RESPONSE_AUCKLAND,
          BCD_RESPONSE_WELLINGTON,
          CROP_RESPONSE_AUCKLAND_2020,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ],
      );
    });
  });

  describe('MOST_RECENT', () => {
    it('should return correct results across a number of data_elements, entities, and periods', async () => {
      const CROP_RESPONSE_AUCKLAND_2019_SANS_CROP2 = {
        ...CROP_RESPONSE_AUCKLAND_2019,
        answers: {
          CROP_1: CROP_RESPONSE_AUCKLAND_2019.answers.CROP_1,
        },
      };
      await assertCorrectResponse(
        {
          organisationUnitCodes: ['NZ_AK', 'NZ_WG'],
          dataElementCodes: ['BCD1TEST', 'BCD325TEST', 'CROP_1', 'CROP_2', 'KITTY_1', 'KITTY_2'],
          startDate: '2019-01-01',
          endDate: '2022-01-01',
          aggregations: [{ type: 'MOST_RECENT' }],
        },
        [
          CROP_RESPONSE_WELLINGTON_2019,
          CROP_RESPONSE_AUCKLAND_2019_SANS_CROP2,
          BCD_RESPONSE_AUCKLAND,
          BCD_RESPONSE_WELLINGTON,
          CROP_RESPONSE_AUCKLAND_2020,
          KITTY_RESPONSE_WELLINGTON_MORNING_20210219W7,
          KITTY_RESPONSE_AUCKLAND_MORNING_20210608W23,
        ],
      );
    });
  });
};
