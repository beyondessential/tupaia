/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ReportServerAggregator } from '../aggregator';
import { FetchReportQuery, StandardOrCustomReportConfig } from '../types';
import { configValidator } from './configValidator';
import { buildContext, ReqContext } from './context';
import { buildFetch, FetchResponse } from './fetch';
import { buildTransform, TransformTable } from './transform';
import { buildOutput } from './output';
import { Row } from './types';
import { OutputType } from './output/functions/outputBuilders';
import { QueryBuilder } from './query';
import { CustomReportOutputType, customReports } from './customReports';

export interface BuiltReport {
  results: OutputType | CustomReportOutputType;
}

export class ReportBuilder {
  private readonly reqContext: ReqContext;
  private config?: StandardOrCustomReportConfig;
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

    if ('customReport' in this.config) {
      const customReportBuilder = customReports[this.config.customReport];
      if (!customReportBuilder) {
        throw new Error(`Custom report ${this.config.customReport} does not exist`);
      }

      const customReportData = await customReportBuilder(this.reqContext, query);
      return { results: customReportData };
    }

    const fetch = this.testData
      ? () => ({ results: this.testData } as FetchResponse)
      : buildFetch(this.config?.fetch);
    const builtQuery = await new QueryBuilder(this.reqContext, this.config, query).build();
    const data = await fetch(aggregator, builtQuery);

    const context = await buildContext(this.config.transform, this.reqContext, data, query);
    const transform = buildTransform(this.config.transform, context);
    const transformedData = transform(TransformTable.fromRows(data.results));

    const outputContext = { ...this.config.fetch };
    const output = buildOutput(this.config.output, outputContext, aggregator);
    const outputData = await output(transformedData);

    return { results: outputData };
  };
}
