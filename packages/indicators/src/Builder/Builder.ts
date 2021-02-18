/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { IndicatorApi } from '../IndicatorApi';
import { Analytic, AnalyticValue, FetchOptions, Indicator } from '../types';

export abstract class Builder {
  protected readonly api: IndicatorApi;

  protected readonly indicator: Indicator;

  constructor(api: IndicatorApi, indicator: Indicator) {
    this.api = api;
    this.indicator = indicator;
  }

  buildAnalytics = async (fetchOptions: FetchOptions): Promise<Analytic[]> => {
    const analyticValues = await this.buildAnalyticValues(fetchOptions);
    return analyticValues.map(value => ({ ...value, dataElement: this.indicator.code }));
  };

  abstract buildAnalyticValues(fetchOptions: FetchOptions): Promise<AnalyticValue[]>;
}
