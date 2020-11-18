/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { getSortByKey, upperFirst } from '@tupaia/utils';
import * as builders from './builders';
import {
  Analytic,
  Builder,
  FetchOptions,
  IndicatorApiInterface,
  IndicatorType,
  ModelRegistry,
} from './types';

export class IndicatorApi implements IndicatorApiInterface {
  private models: ModelRegistry;

  private aggregator: Aggregator;

  constructor(models: ModelRegistry, dataBroker: DataBroker) {
    this.models = models;
    this.aggregator = new Aggregator(dataBroker);
  }

  getAggregator() {
    return this.aggregator;
  }

  async buildAnalytics(codes: string[], fetchOptions: FetchOptions): Promise<Analytic[]> {
    const indicators = await this.models.indicator.find({ code: codes });
    const nestedAnalytics = await Promise.all(
      indicators.map(async indicator => this.buildAnalyticsForIndicator(indicator, fetchOptions)),
    );
    return nestedAnalytics.flat().sort(getSortByKey('period'));
  }

  buildAnalyticsForIndicator = async (
    indicator: Omit<IndicatorType, 'id'>,
    fetchOptions: FetchOptions,
  ) => {
    const { code, builder, config } = indicator;
    const buildAnalyticValues = this.getBuilderFunction(builder);
    const analyticValues = await buildAnalyticValues({ api: this, config, fetchOptions });

    return analyticValues.map(value => ({ ...value, dataElement: code }));
  };

  private getBuilderFunction = (builderName: string): Builder => {
    const builderFunctionName = `build${upperFirst(builderName)}`;
    if (!(builderFunctionName in builders)) {
      throw new Error(`'${builderName}' is not an indicator builder`);
    }

    return builders[builderFunctionName as keyof typeof builders];
  };
}
