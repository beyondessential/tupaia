/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../aggregator';
import { FetchReportQuery } from '../types';
import { buildFetch } from './fetch';
import { buildTransform } from './transform';
import { buildOutput } from './output';
import { Row } from './types';
import { OutputType } from './output/functions/outputBuilders';

export interface BuiltReport {
  results: OutputType;
}

export class ReportBuilder {
  config?: Record<string, unknown>;

  testData?: Row[];

  setConfig = (config: Record<string, unknown>) => {
    this.config = config;
    return this;
  };

  setTestData = (testData: Row[]) => {
    this.testData = testData;
    return this;
  };

  build = async (aggregator: Aggregator, query: FetchReportQuery): Promise<BuiltReport> => {
    if (!this.config) {
      throw new Error('Report requires a config be set');
    }
    const fetch = this.testData
      ? () => ({ results: this.testData as Row[] })
      : buildFetch(this.config?.fetch);
    const transform = buildTransform(this.config.transform);
    const output = buildOutput(this.config.output);

    const data = await fetch(aggregator, query);
    const transformedData = transform(data.results);
    const outputData = output(transformedData);
    return { results: outputData };
  };
}
