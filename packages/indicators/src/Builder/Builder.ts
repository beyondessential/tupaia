/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticsRepository } from '../AnalyticsRepository';
import { Aggregation, AggregationListsMap, Analytic, AnalyticValue, Indicator } from '../types';

export abstract class Builder {
  protected readonly indicator: Indicator;

  constructor(indicator: Indicator) {
    this.indicator = indicator;
  }

  getIndicator = () => this.indicator;

  /**
   * Returns all element codes referenced in this Builder
   */
  abstract getElementCodes(): string[];

  abstract getAggregationListsMap(): AggregationListsMap;

  /**
   * @param extraAggregations Useful for passing aggregations top-down to nested indicators
   */
  buildAnalytics = (
    analyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    extraAggregations: Aggregation[] = [],
  ): Analytic[] =>
    this.buildAnalyticValues(analyticsRepo, buildersByIndicator, extraAggregations).map(value => ({
      ...value,
      dataElement: this.indicator.code,
    }));

  abstract buildAnalyticValues(
    analyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    extraAggregations: Aggregation[],
  ): AnalyticValue[];
}
