/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { capital } from 'case';

import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { getSortByKey } from '@tupaia/utils';
import * as builders from './builders';
import { Analytic, Builder, FetchOptions, IndicatorType, ModelRegistry } from './types';

export class IndicatorApi {
  private models: ModelRegistry;
  private aggregator: Aggregator;

  constructor(models: ModelRegistry, dataBroker: DataBroker) {
    this.models = models;
    this.aggregator = new Aggregator(dataBroker);
  }

  async buildAnalytics(codes: string[], fetchOptions: FetchOptions): Promise<Analytic[]> {
    const indicators = await this.models.indicator.find({ code: codes });
    const nestedAnalytics = await Promise.all(
      indicators.map(async indicator => this.buildAnalyticsForIndicator(indicator, fetchOptions)),
    );
    return nestedAnalytics.flat().sort(getSortByKey('period'));
  }

  private buildAnalyticsForIndicator = async (
    indicator: IndicatorType,
    fetchOptions: FetchOptions,
  ) => {
    const { code, builder, config } = indicator;
    const buildAnalyticValues = this.getBuilderFunction(builder);
    const analyticValues = await buildAnalyticValues({
      aggregator: this.aggregator,
      config,
      fetchOptions,
    });

    return analyticValues.map(value => ({ ...value, dataElement: code }));
  };

  private getBuilderFunction = (builderName: string): Builder => {
    const builderFunctionName = `build${capital(builderName)}`;
    const builderFunction = builders[builderFunctionName];
    if (!builderFunction) {
      throw new Error(`'${builderName}' is not an indicator builder`);
    }

    return builderFunction;
  };
}
