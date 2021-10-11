/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  addMomentOffset,
  convertDateRangeToPeriodString,
  convertPeriodStringToDateRange,
  getDefaultPeriod,
  momentToDateString,
  utcMoment,
} from '@tupaia/utils';

import { FetchReportQuery, PeriodParams, ReportConfig } from '../types';

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year';

type DateOffset = {
  unit: PeriodType;
  offset?: number;
  modifier?: 'start_of' | 'end_of';
  modifierUnit?: PeriodType;
};

export type DateSpecs = string | DateOffset;

const buildDateUsingSpecs = (date: string | undefined, dateOffset: DateOffset) => {
  const moment = addMomentOffset(utcMoment(date), dateOffset);
  return momentToDateString(moment);
};

export class QueryBuilder {
  private readonly config: ReportConfig;

  private readonly query: FetchReportQuery;

  constructor(config: ReportConfig, query: FetchReportQuery) {
    this.config = config;
    this.query = query;
  }

  public build() {
    const { period, startDate, endDate } = this.buildPeriodParams();
    return { ...this.query, period, startDate, endDate };
  }

  private buildPeriodParams(): Required<PeriodParams> {
    let { period = getDefaultPeriod(), startDate, endDate } = this.query;
    const { startDate: startDateSpecs, endDate: endDateSpecs } = this.config.fetch;

    // Use specific date if date specs is string
    if (typeof startDateSpecs === 'string') {
      startDate = startDateSpecs;
    }
    if (typeof endDateSpecs === 'string') {
      endDate = endDateSpecs;
    }

    // Calculate missing period params using other existing params/default values
    if (startDate && endDate) {
      // Force period to be consistent with start and end dates
      period = convertDateRangeToPeriodString(startDate, endDate);
    } else if (startDate) {
      [, endDate] = convertPeriodStringToDateRange(period);
    } else if (endDate) {
      [startDate] = convertPeriodStringToDateRange(period);
    } else {
      [startDate, endDate] = convertPeriodStringToDateRange(period);
    }

    // Apply date offset if date specs is object
    if (typeof startDateSpecs === 'object') {
      startDate = buildDateUsingSpecs(endDate, startDateSpecs);
    }
    if (typeof endDateSpecs === 'object') {
      endDate = buildDateUsingSpecs(endDate, endDateSpecs);
    }

    if (!this.matchesOriginalQuery({ startDate, endDate })) {
      // Re-adjust period to the new date range
      period = convertDateRangeToPeriodString(startDate, endDate);
    }

    return { period, startDate, endDate } as Required<PeriodParams>;
  }

  private matchesOriginalQuery(subQuery: Record<string, unknown>) {
    return Object.entries(subQuery).every(
      ([key, value]) => this.query[key as keyof FetchReportQuery] === value,
    );
  }
}
