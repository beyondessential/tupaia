import { Aggregator } from '../aggregator';
import { FetchReportQuery, ReportConfig } from '../types';
import { buildFetch } from './fetch';
import { buildTransform } from './transform';
import { Row } from './types';

interface BuildReport {
  results: Row[];
}

export class ReportBuilder {
  readonly config: ReportConfig;

  readonly aggregator: Aggregator;

  readonly query: FetchReportQuery;

  readonly testData: Row[];

  constructor(
    config: ReportConfig,
    aggregator: Aggregator,
    query: FetchReportQuery,
    testData: Row[] = [],
  ) {
    this.config = config;
    this.aggregator = aggregator;
    this.query = query;
    this.testData = testData;
  }

  build = async (): Promise<BuildReport> => {
    const fetch = buildFetch(this.config.fetch);
    const transform = buildTransform(this.config.transform);
    const data =
      this.testData.length > 0
        ? { results: this.testData }
        : await fetch(this.aggregator, this.query);
    data.results = transform(data.results);
    return data;
  };
}
