/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AnalyticValue, FetchOptions, IndicatorApiInterface } from '../types';

export abstract class Builder {
  protected indicatorApi: IndicatorApiInterface;

  constructor(indicatorApi: IndicatorApiInterface) {
    this.indicatorApi = indicatorApi;
  }

  abstract buildAnalyticValues(
    config: Record<string, unknown>,
    fetchOptions: FetchOptions,
  ): Promise<AnalyticValue[]>;
}
