/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  addMomentOffset,
  convertDateRangeToPeriodString,
  convertPeriodStringToDateRange,
  getDefaultPeriod,
  momentToPeriod,
  periodToDateString,
  utcMoment,
} from '@tupaia/utils';

import { DateOffset, FetchReportQuery, PeriodParams, ReportConfig } from '../types';

const buildDateUsingSpecs = (
  date: string | undefined,
  dateOffset: DateOffset,
  { isEndDate = false },
) => {
  const moment = addMomentOffset(utcMoment(date), dateOffset);
  const periodType = dateOffset.modifierUnit || dateOffset.unit;
  const period = momentToPeriod(moment, periodType);
  return periodToDateString(period, isEndDate);
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
      startDate = buildDateUsingSpecs(endDate, startDateSpecs, { isEndDate: false });
    }
    if (typeof endDateSpecs === 'object') {
      endDate = buildDateUsingSpecs(endDate, endDateSpecs, { isEndDate: true });
    }

    if (!this.matchesOriginalQuery({ startDate, endDate })) {
      // Re-adjust period to the new date range
      period = convertDateRangeToPeriodString(startDate, endDate);
    }

    return { period, startDate, endDate } as Required<PeriodParams>;
  }

  private matchesOriginalQuery(subQuery: Record<string, unknown>) {
    return Object.entries(subQuery).every(
      ([key, value]) => key in this.query && this.query[key as keyof FetchReportQuery] === value,
    );
  }
}
