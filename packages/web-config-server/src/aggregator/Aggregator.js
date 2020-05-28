import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from './QueryBuilder';

export class Aggregator extends BaseAggregator {
  constructor(dataBroker, routeHandler) {
    super(dataBroker);
    this.routeHandler = routeHandler;
  }

  async fetchAnalytics(
    dataElementCodes,
    originalQuery,
    replacementValues,
    initialAggregationOptions,
  ) {
    const queryBuilder = new QueryBuilder(
      originalQuery,
      replacementValues,
      initialAggregationOptions,
      this.routeHandler,
    );
    const { fetchOptions, aggregationOptions } = await queryBuilder.build();

    return super.fetchAnalytics(dataElementCodes, fetchOptions, aggregationOptions);
  }

  async fetchEvents(programCode, originalQuery, replacementValues) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues, this.routeHandler);
    await queryBuilder.fetchAndReplaceOrgUnitCodes();
    queryBuilder.makeEventReplacements();

    return super.fetchEvents(programCode, queryBuilder.query);
  }
}
