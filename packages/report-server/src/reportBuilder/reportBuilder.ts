/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '../aggregator';
import { FetchReportQuery } from '../types';
import { buildContext, ReqContext } from './context';
import { buildFetch, FetchResponse } from './fetch';
import { buildTransform } from './transform';
import { buildOutput } from './output';
import { Row } from './types';

export class ReportBuilder {
  reqContext: ReqContext;

  config?: Record<string, unknown>;

  testData?: Row[];

  constructor(reqContext: ReqContext) {
    this.reqContext = reqContext;
  }

  public setConfig = (config: Record<string, unknown>) => {
    this.config = config;
    return this;
  };

  public setTestData = (testData: Row[]) => {
    this.testData = testData;
    return this;
  };

  public build = async (aggregator: Aggregator, query: FetchReportQuery) => {
    if (!this.config) {
      throw new Error('Report requires a config be set');
    }

    const fetch = this.testData
      ? () => ({ results: this.testData } as FetchResponse)
      : buildFetch(this.config?.fetch);

    const fetchResponse = await fetch(aggregator, query);
    const context = await buildContext(this.config.transform, this.reqContext, fetchResponse);
    const transform = buildTransform(this.config.transform, context);
    const output = buildOutput(this.config.output);

    const { results: data, ...metadata } = fetchResponse;
    const transformedData = transform(data);
    const outputData = output({ results: transformedData, ...metadata });

    return outputData;
  };
}
