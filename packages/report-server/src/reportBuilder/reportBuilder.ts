/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../aggregator';
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
  reqContext: ReqContext;

  config?: ReportConfig;

  testData?: Row[];

  constructor(reqContext: ReqContext) {
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

  private fetch = async (config: ReportConfig, aggregator: Aggregator, query: FetchReportQuery) => {
    if (this.testData) {
      return { results: this.testData } as FetchResponse;
    }
    const builtQuery = await new QueryBuilder(this.reqContext, config, query).build();
    return buildFetch(config.fetch)(aggregator, builtQuery);
  };

  public build = async (aggregator: Aggregator, query: FetchReportQuery): Promise<BuiltReport> => {
    if (!this.config) {
      throw new Error('Report requires a config be set');
    }

    const fetchData = await this.fetch(this.config, aggregator, query);
    const context = await buildContext(this.config.transform, this.reqContext, fetchData);
    const transform = buildTransform(this.config.transform, context);
    const transformedData = transform(fetchData.results);
    const output = buildOutput(this.config.output);
    const outputData = output(transformedData);

    return { results: outputData };
  };
}
