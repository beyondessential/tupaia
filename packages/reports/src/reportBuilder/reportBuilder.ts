import { Aggregator } from '../aggregator';
import { FetchReportQuery } from '../types';
import { buildFetch } from './fetch';
import { buildTransform } from './transform';
import { Row } from './types';

interface BuildReport {
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
    const fetch = buildFetch(this.report.config.fetch);
    const transform = buildTransform(this.report.config.transform);
    const data = await fetch(this.aggregator, this.query);
    data.results = transform(data.results);
    return data;
  };
}
