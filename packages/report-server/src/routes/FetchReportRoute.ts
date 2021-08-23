/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { createAggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';

import { Aggregator } from '../aggregator';
import { ReportBuilder, BuiltReport } from '../reportBuilder';
import { ReportType } from '../models';
import { ReportRouteQuery, ReportRouteBody } from './types';

export type FetchReportRequest = Request<
  { reportCode: string },
  BuiltReport,
  ReportRouteBody | Record<string, never>,
  ReportRouteQuery
>;

export class FetchReportRoute extends Route<FetchReportRequest> {
  async findReport() {
    const { models, params } = this.req;
    const { reportCode } = params;
    const report = await models.report.findOne({ code: reportCode });
    if (!report) {
      throw new Error(`No report found with code ${reportCode}`);
    }

    return report;
  }

  async getRequestedOrgUnitObjects(
    hierarchy = 'explore',
    requestedOrgUnitCodes: string[],
  ): Promise<{ code: string; country_code: string | null; type: string | null }[]> {
    const { ctx } = this.req;
    const entities = await ctx.microServices.entityApi.getEntities(
      hierarchy,
      requestedOrgUnitCodes,
      {
        fields: ['code', 'country_code', 'type'],
      },
    );
    if (entities.length === 0) {
      throw new Error(`No entities found with codes ${requestedOrgUnitCodes}`);
    }

    // If entity is a project
    if (entities.length === 1 && entities[0].type === 'project') {
      const countryEntities = await ctx.microServices.entityApi.getDescendantsOfEntities(
        hierarchy,
        requestedOrgUnitCodes,
        {
          fields: ['code', 'country_code', 'type'],
          filter: { type: 'country' },
        },
        false,
      );

      return countryEntities;
    }
    return entities;
  }

  async getAccessibleOrgUnitCodes(
    report: ReportType,
    hierarchy = 'explore',
    requestedOrgUnitCodes: string | string[],
  ) {
    const { accessPolicy } = this.req;
    const permissionGroupName = await report.permissionGroupName();

    const requestedOrgUnitCodesArray = Array.isArray(requestedOrgUnitCodes)
      ? requestedOrgUnitCodes
      : requestedOrgUnitCodes.split(',');
    const foundOrgUnits = await this.getRequestedOrgUnitObjects(
      hierarchy,
      requestedOrgUnitCodesArray,
    );

    const accessibleOrgUnits = foundOrgUnits.filter(
      ({ country_code: countryCode }) =>
        countryCode !== null && accessPolicy.allows(countryCode, permissionGroupName),
    );
    if (accessibleOrgUnits.length === 0) {
      throw new Error(`No permissions to any one of entities ${foundOrgUnits}`);
    }
    return accessibleOrgUnits.map(orgUnit => orgUnit.code);
  }

  async buildResponse() {
    const { query, body } = this.req;
    const { organisationUnitCodes, hierarchy, ...restOfParams } = { ...query, ...body };
    if (!organisationUnitCodes) {
      throw new Error('Must provide organisationUnitCodes URL parameter');
    }
    const report = await this.findReport();

    const accessibleOrgUnitCodes = await this.getAccessibleOrgUnitCodes(
      report,
      hierarchy,
      organisationUnitCodes,
    );

    const aggregator = createAggregator(Aggregator, this.req.ctx);
    return new ReportBuilder().setConfig(report.config).build(aggregator, {
      organisationUnitCodes: accessibleOrgUnitCodes,
      hierarchy,
      ...restOfParams,
    });
  }
}
