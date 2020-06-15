import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from './QueryBuilder';
import { buildAggregationOptions } from './buildAggregationOptions';

export class Aggregator extends BaseAggregator {
  constructor(dataBroker, routeHandler) {
    super(dataBroker);
    this.routeHandler = routeHandler;
  }

  async fetchAnalytics(
    dataElementCodes,
    originalQuery,
    replacementValues,
    initialAggregationOptions = {},
  ) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues, this.routeHandler);
    const dataSourceEntities = await queryBuilder.getDataSourceEntities();

    const fetchOptions = await queryBuilder.build(dataSourceEntities);

    const entityAggregationOptions = queryBuilder.getEntityAggregationOptions();
    const aggregationOptions = await buildAggregationOptions(
      initialAggregationOptions,
      dataSourceEntities,
      entityAggregationOptions,
    );

    return super.fetchAnalytics(dataElementCodes, fetchOptions, aggregationOptions);
  }

  async fetchEvents(programCode, originalQuery, replacementValues) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues, this.routeHandler);
    const dataSourceEntities = await queryBuilder.getDataSourceEntities();

    queryBuilder.replaceOrgUnitCodes(dataSourceEntities);
    queryBuilder.makeEventReplacements();

    const entityAggregationOptions = queryBuilder.getEntityAggregationOptions();
    const aggregationOptions = await buildAggregationOptions(
      {}, // No input aggregation for events (yet)
      dataSourceEntities,
      entityAggregationOptions,
    );

    return super.fetchEvents(programCode, queryBuilder.getQuery(), aggregationOptions);
  }
}
