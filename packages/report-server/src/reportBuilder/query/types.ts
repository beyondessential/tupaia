/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type DateOffset = {
  unit: PeriodType;
  offset?: number;
  modifier?: 'start_of' | 'end_of';
  modifierUnit?: PeriodType;
};

export type DateSpecs = string | DateOffset;
