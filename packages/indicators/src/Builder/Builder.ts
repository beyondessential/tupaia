/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticsRepository } from '../AnalyticsRepository';
import { Aggregation, Analytic, AnalyticValue, FetchOptions, Indicator } from '../types';

export abstract class Builder {
  protected readonly indicator: Indicator;

  protected readonly isRoot: boolean;

  constructor(indicator: Indicator, isRoot = false) {
    this.indicator = indicator;
    this.isRoot = isRoot;
  }

  getIndicator = () => this.indicator;

  /**
   * Returns all element codes referenced in this Builder
   */
  abstract getElementCodes(): string[];

  abstract getAggregations(): Aggregation[];

  buildAnalytics = (
    populatedAnalyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    fetchOptions: FetchOptions,
  ): Analytic[] => {
    if (!populatedAnalyticsRepo.isPopulated()) {
      throw new Error(
        'buildAnalytics expects that the provided analyticsRepository is already populated',
      );
    }

    return this.buildAnalyticValues(
      populatedAnalyticsRepo,
      buildersByIndicator,
      fetchOptions,
    ).map(value => ({ ...value, dataElement: this.indicator.code }));
  };

  abstract buildAnalyticValues(
    populatedAnalyticsRepo: AnalyticsRepository,
    buildersByIndicator: Record<string, Builder>,
    fetchOptions: FetchOptions,
  ): AnalyticValue[];
}
