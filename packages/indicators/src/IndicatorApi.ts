/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { DataBroker } from '@tupaia/data-broker';
import { getSortByKey } from '@tupaia/utils';
import { Builder, createBuilder } from './Builder';
import { Analytic, FetchOptions, ModelRegistry } from './types';

export class IndicatorApi {
  private models: ModelRegistry;

  private aggregator: Aggregator;

  constructor(models: ModelRegistry, dataBroker: DataBroker) {
    this.models = models;
    this.aggregator = new Aggregator(dataBroker);
  }

  getAggregator = () => this.aggregator;

  async buildAnalytics(indicatorCodes: string[], fetchOptions: FetchOptions): Promise<Analytic[]> {
    const indicators = await this.models.indicator.find({ code: indicatorCodes });
    const builders = indicators.map(indicator => createBuilder(this, indicator));
    return this.buildAnalyticsForBuilders(builders, fetchOptions);
  }

  async buildAnalyticsForBuilders(
    builders: Builder[],
    fetchOptions: FetchOptions,
  ): Promise<Analytic[]> {
    const nestedAnalytics = await Promise.all(
      builders.map(async builder => builder.buildAnalytics(fetchOptions)),
    );
    return nestedAnalytics.flat().sort(getSortByKey('period'));
  }
}
