/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { FetchReportQuery, ReportConfig } from '../../types';
import { buildPeriodParams } from './buildPeriodParams';

export class QueryBuilder {
  private readonly config: ReportConfig;

  private readonly query: FetchReportQuery;

  constructor(config: ReportConfig, query: FetchReportQuery) {
    this.config = config;
    this.query = query;
  }

  public build() {
    const { period, startDate, endDate } = buildPeriodParams(this.query, this.config);
    return { ...this.query, period, startDate, endDate };
  }
}
