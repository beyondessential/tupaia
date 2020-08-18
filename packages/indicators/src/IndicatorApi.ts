/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { capital } from 'case';

import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import * as builders from './builders';
import { Analytic, FetchOptions, ModelRegistry } from './types';

export class IndicatorApi {
  private models: ModelRegistry;
  private aggregator: Aggregator;

  constructor(models: ModelRegistry, dataBroker: DataBroker) {
    this.models = models;
    this.aggregator = new Aggregator(dataBroker);
  }

  async buildAnalytics(codes: string[], fetchOptions: FetchOptions): Promise<Analytic[]> {
    const indicators = await this.models.indicator.find({ code: codes });

    const analytics: Analytic[] = [];
    await Promise.all(
      indicators.map(async indicator => {
        const newAnalytics = await this.buildAnalyticsForIndicator(indicator, fetchOptions);
        analytics.push(...newAnalytics);
      }),
    );

    return analytics;
  }

  private buildAnalyticsForIndicator = async (indicator, fetchOptions: FetchOptions) => {
    const { builder, config } = indicator;
    const buildAnalytics = this.getBuilderFunction(builder);
    return buildAnalytics({ aggregator: this.aggregator, config, fetchOptions });
  };

  private getBuilderFunction = (builderName: string) => {
    const builderFunctionName = `build${capital(builderName)}`;
    const builderFunction = builders[builderFunctionName];
    if (!builderFunction) {
      throw new Error(`'${builderName}' is not an indicator builder`);
    }

    return builderFunction;
  };
}
