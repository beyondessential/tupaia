/* eslint-disable @typescript-eslint/no-unused-vars */
import { isEqual } from 'es-toolkit/compat';
import { ReportApiInterface } from '..';
import { RequestBody } from '../ApiConnection';
import { QueryParameters } from '../../types';

type ReportStub = {
  parameters?: Record<string, unknown>;
  results: Record<string, unknown>[];
  error?: string;
};

export class MockReportApi implements ReportApiInterface {
  private readonly reports: Record<string, ReportStub>;

  public constructor(reports: Record<string, ReportStub> = {}) {
    this.reports = reports;
  }

  public testReport(query: QueryParameters, body: RequestBody): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchAggregationOptions(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public fetchTransformSchemas(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  public async fetchReport(reportCode: string, query?: QueryParameters | null) {
    const report = this.reports[reportCode];
    if (!report) {
      throw new Error(`Report ${reportCode} not found.`);
    }

    const { results, parameters, error } = report;
    if (error) {
      throw new Error(error);
    }

    if (!parameters) {
      // No parameters required
      return results;
    }

    if (isEqual(parameters, query)) {
      // Parameters required and match query
      return results;
    }

    // Parameters required but don't match query
    return [];
  }
}
