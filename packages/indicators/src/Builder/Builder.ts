/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticValue, FetchOptions, IndicatorApiInterface } from '../types';

export abstract class Builder {
  private indicatorApi: IndicatorApiInterface;

  constructor(indicatorApi: IndicatorApiInterface) {
    this.indicatorApi = indicatorApi;
  }

  getIndicatorApi() {
    return this.indicatorApi;
  }

  abstract async buildAnalyticValues(
    config: Record<string, unknown>,
    fetchOptions: FetchOptions,
  ): Promise<AnalyticValue[]>;
}
