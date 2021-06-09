/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../aggregator';
import { FetchReportQuery, ReportConfig } from '../types';
import { buildFetch } from './fetch';
import { buildTransform } from './transform';
import { buildOutput } from './output';
import { Row } from './types';
import { OutputType } from './output/functions/outputBuilders';

interface BuildReport {
  results: OutputType;
}

export class ReportBuilder {
  config?: ReportConfig;

  testData?: Row[];

  setConfig = (config: ReportConfig) => {
    this.config = config;
  };

  setTestData = (testData: Row[]) => {
    this.testData = testData;
  };

  build = async (aggregator: Aggregator, query: FetchReportQuery): Promise<BuildReport> => {
    if (!this.config) {
      throw new Error('Report requires a config be set');
    }
    const fetch = buildFetch(this.config.fetch);
    const transform = buildTransform(this.config.transform);
    const output = buildOutput(this.config.output);

    const data = this.testData ? { results: this.testData } : await fetch(aggregator, query);
    const transformedData = transform(data.results);
    const outputData = output(transformedData);
    return { results: outputData };
  };
}
