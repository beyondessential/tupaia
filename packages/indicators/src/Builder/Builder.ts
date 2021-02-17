/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticsRepository } from '../AnalyticsRepository';
import { Aggregation, AggregationList, Analytic, AnalyticValue, Indicator } from '../types';

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

  abstract getAggregationListsByElement(): Record<string, AggregationList[]>;

  /**
   * @param wrapperAggregations Useful for passing aggregations top-down to nested indicators
   */
  buildAnalytics = (
    analyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    wrapperAggregations: Aggregation[] = [],
  ): Analytic[] =>
    this.buildAnalyticValues(analyticsRepo, buildersByIndicator, wrapperAggregations).map(
      value => ({
        ...value,
        dataElement: this.indicator.code,
      }),
    );

  abstract buildAnalyticValues(
    analyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    wrapperAggregations: Aggregation[],
  ): AnalyticValue[];
}
