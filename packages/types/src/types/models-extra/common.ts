/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 *
 */

export enum VizPeriodGranularity {
  'DAY' = 'day',
  'SINGLE_DAY' = 'one_day_at_a_time',
  'WEEK' = 'week',
  'SINGLE_WEEK' = 'one_week_at_a_time',
  'MONTH' = 'month',
  'SINGLE_MONTH' = 'one_month_at_a_time',
  'QUARTER' = 'quarter',
  'SINGLE_QUARTER' = 'one_quarter_at_a_time',
  'YEAR' = 'year',
  'SINGLE_YEAR' = 'one_year_at_a_time',
}

export type DateOffsetSpec = {
  unit: PeriodUnit;
  offset: number;
  modifier?: OffsetModifier;
  modifierUnit?: PeriodUnit;
};

enum OffsetModifier {
  start_of = 'start_of',
  end_of = 'end_of',
}

export type PeriodUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';
