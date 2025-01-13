import { Aggregator } from '@tupaia/aggregator';
import { getSortByKey } from '@tupaia/utils';
import { Builder, createBuilder } from './Builder';
import { Analytic, DataBroker, FetchOptions, ModelRegistry } from './types';

export class IndicatorApi {
  private readonly models: ModelRegistry;
  private readonly aggregator: Aggregator;

  public constructor(models: ModelRegistry, dataBroker: DataBroker) {
    this.models = models;
    this.aggregator = new Aggregator(dataBroker);
  }

  public getAggregator = () => this.aggregator;

  public async buildAnalytics(
    indicatorCodes: string[],
    fetchOptions: FetchOptions,
  ): Promise<Analytic[]> {
    const indicators = await this.models.indicator.find({ code: indicatorCodes });
    const builders = indicators.map(indicator => createBuilder(this, indicator));
    return this.buildAnalyticsForBuilders(builders, fetchOptions);
  }

  public async buildAnalyticsForBuilders(
    builders: Builder[],
    fetchOptions: FetchOptions,
  ): Promise<Analytic[]> {
    const nestedAnalytics = await Promise.all(
      builders.map(async builder => builder.buildAnalytics(fetchOptions)),
    );
    return nestedAnalytics.flat().sort(getSortByKey('period'));
  }
}
