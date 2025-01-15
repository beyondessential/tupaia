import { IndicatorApi } from '../IndicatorApi';
import { Analytic, AnalyticValue, FetchOptions, Indicator } from '../types';

export abstract class Builder {
  protected readonly api: IndicatorApi;

  protected readonly indicator: Indicator;

  constructor(api: IndicatorApi, indicator: Indicator) {
    this.api = api;
    this.indicator = indicator;
  }

  public buildAnalytics = async (fetchOptions: FetchOptions): Promise<Analytic[]> => {
    const analyticValues = await this.buildAnalyticValues(fetchOptions);
    return analyticValues.map(value => ({ ...value, dataElement: this.indicator.code }));
  };

  protected abstract buildAnalyticValues(fetchOptions: FetchOptions): Promise<AnalyticValue[]>;
}
