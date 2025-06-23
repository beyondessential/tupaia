import { Request } from 'express';
import { Aggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';
import { DataBroker } from '@tupaia/data-broker';
import { isNotNullish, isObject } from '@tupaia/tsutils';
import { ReportServerAggregator } from '../aggregator';
import { ReportBuilder, BuiltReport } from '../reportBuilder';
import { ReportRouteQuery, ReportRouteBody } from './types';
import { parseOrgUnitCodes } from './parseOrgUnitCodes';
import { Matrix } from '../reportBuilder/output/functions/matrix/types';

export type FetchReportRequest = Request<
  { reportCode: string },
  BuiltReport,
  ReportRouteBody | Record<string, never>,
  ReportRouteQuery
>;

const isMatrixResponse = (results: BuiltReport['results']): results is Matrix => {
  if (!isObject(results)) return false;
  if (results.hasOwnProperty('rows') && results.hasOwnProperty('columns')) return true;
  return false;
};

export class FetchReportRoute extends Route<FetchReportRequest> {
  private async findReport() {
    const { models, params } = this.req;
    const { reportCode } = params;
    const report = await models.report.findOne({ code: reportCode });
    if (!report) {
      throw new Error(`No report found with code ${reportCode}`);
    }

    return report;
  }

  private getHasData = (results: BuiltReport['results']) => {
    // If the results are null or undefined, there is no data
    if (!isNotNullish(results)) return false;
    // If the results are an array, check if it has any elements
    if (Array.isArray(results)) return results.length > 0;
    // If the results are a matrix, check if it has any rows
    if (isMatrixResponse(results)) return results.rows.length > 0;
    // If the results are an object, check if it has any keys
    if (isObject(results)) return Object.keys(results).length > 0;
    // otherwise, there is no data
    return false;
  };

  public async buildResponse() {
    const { query, body } = this.req;
    const { organisationUnitCodes, hierarchy = 'explore', ...restOfParams } = { ...query, ...body };

    const report = await this.findReport();
    const permissionGroupName = await report.permissionGroupName();

    const reportQuery = {
      organisationUnitCodes: parseOrgUnitCodes(organisationUnitCodes),
      hierarchy,
      ...restOfParams,
    };

    const reqContext = {
      query: reportQuery,
      hierarchy,
      permissionGroup: permissionGroupName,
      services: this.req.ctx.services,
      accessPolicy: this.req.accessPolicy,
      aggregator: new ReportServerAggregator(
        new Aggregator(
          new DataBroker({
            accessPolicy: this.req.accessPolicy,
            services: this.req.ctx.services,
          }),
        ),
      ),
    };

    const reportBuilder = new ReportBuilder(reqContext).setConfig(report.config);
    const reportResponse = await reportBuilder.build();

    const { results } = reportResponse;

    // If the report has more than one result, update the report.latest_data_parameters with the request parameters
    if (this.getHasData(results)) {
      await report.setLatestDataParameters({
        hierarchy,
        organisationUnitCodes,
        ...restOfParams,
      });
    }
    return reportResponse;
  }
}
