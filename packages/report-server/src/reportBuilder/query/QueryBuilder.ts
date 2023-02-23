/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Report } from '@tupaia/types';
import { ReqContext } from '../context';
import { FetchReportQuery } from '../../types';
import { buildPeriodParams } from './buildPeriodParams';
import { buildOrganisationUnitParams } from './buildOrganisationUnitParams';

export class QueryBuilder {
  private readonly ctx: ReqContext;
  private readonly config: Report['config'];
  private readonly query: FetchReportQuery;

  public constructor(context: ReqContext, config: Report['config'], query: FetchReportQuery) {
    this.ctx = context;
    this.config = config;
    this.query = query;
  }

  public async build() {
    const { period, startDate, endDate } = buildPeriodParams(this.query, this.config);
    const organisationUnitCodes = await buildOrganisationUnitParams(
      this.ctx,
      this.query,
      this.config,
    );
    return { ...this.query, organisationUnitCodes, period, startDate, endDate };
  }
}
