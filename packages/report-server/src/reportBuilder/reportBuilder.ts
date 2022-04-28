/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ReportServerAggregator } from '../aggregator';
import { FetchReportQuery, ReportConfig } from '../types';
import { configValidator } from './configValidator';
import { buildContext, ReqContext } from './context';
import { buildFetch, FetchResponse } from './fetch';
import { buildTransform } from './transform';
import { buildOutput } from './output';
import { Row } from './types';
import { OutputType } from './output/functions/outputBuilders';
import { QueryBuilder } from './query';

export interface BuiltReport {
  results: OutputType;
}

export class ReportBuilder {
  private readonly reqContext: ReqContext;
  private config?: ReportConfig;
  private testData?: Row[];

  public constructor(reqContext: ReqContext) {
    this.reqContext = reqContext;
  }

  public setConfig = (config: Record<string, unknown>) => {
    this.config = configValidator.validateSync(config);
    return this;
  };

  public setTestData = (testData: Row[]) => {
    this.testData = testData;
    return this;
  };

  public build = async (
    aggregator: ReportServerAggregator,
    query: FetchReportQuery,
  ): Promise<BuiltReport> => {
    if (!this.config) {
      throw new Error('Report requires a config be set');
    }

    const fetch = this.testData
      ? () => ({ results: this.testData } as FetchResponse)
      : buildFetch(this.config?.fetch);
    const builtQuery = await new QueryBuilder(this.reqContext, this.config, query).build();
    const data = await fetch(aggregator, builtQuery);

    const context = await buildContext(this.config.transform, this.reqContext, data);
    const transform = buildTransform(this.config.transform, context);
    const transformedData = transform(data.results);

    const output = buildOutput({ ...this.config.output, ...this.config.fetch }, aggregator);
    const outputData = await output(transformedData);

    return { results: outputData };
  };
}
