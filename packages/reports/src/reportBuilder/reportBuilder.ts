import { Aggregator } from '../aggregator';
import { FetchReportQuery } from '../routes/fetchReport';
import { fetch, FetchResponse } from './fetch';
import { buildTransform } from './transform';

export type FieldValue = string | number | boolean | undefined;
export const isValidFieldValue = (fieldValue: any): fieldValue is FieldValue => {
  return (
    typeof fieldValue === 'number' ||
    typeof fieldValue === 'string' ||
    typeof fieldValue === 'boolean' ||
    fieldValue === undefined
  );
};

export interface Row {
  [field: string]: FieldValue;
}

export interface BuildReport {
  results: Row[];
}

export class ReportBuilder {
  readonly report;
  readonly aggregator: Aggregator;
  readonly query: FetchReportQuery;

  constructor(report, aggregator: Aggregator, query: FetchReportQuery) {
    this.report = report;
    this.aggregator = aggregator;
    this.query = query;
  }

  build = async (): Promise<BuildReport> => {
    const data: FetchResponse = await fetch(this.report.config.fetch, this.aggregator, this.query);
    const builtTransform = buildTransform(this.report.config.transform);
    data.results = builtTransform(data.results);
    return data;
  };
}
