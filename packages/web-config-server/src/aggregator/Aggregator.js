import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from './QueryBuilder';
import { buildAggregationOptions } from './buildAggregationOptions';

export class Aggregator extends BaseAggregator {
  constructor(dataBroker, models, routeHandler) {
    super(dataBroker);
    this.models = models;
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
    const hierarchyId = await this.routeHandler.fetchHierarchyId();

    const fetchOptions = await queryBuilder.build(dataSourceEntities);

    const entityAggregationOptions = queryBuilder.getEntityAggregationOptions();
    const aggregationOptions = await buildAggregationOptions(
      this.models,
      initialAggregationOptions,
      dataSourceEntities,
      entityAggregationOptions,
      hierarchyId,
    );

    return super.fetchAnalytics(dataElementCodes, fetchOptions, aggregationOptions);
  }

  async fetchEvents(programCode, originalQuery, replacementValues) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues, this.routeHandler);
    const dataSourceEntities = await queryBuilder.getDataSourceEntities();
    const hierarchyId = await this.routeHandler.fetchHierarchyId();

    queryBuilder.replaceOrgUnitCodes(dataSourceEntities);
    queryBuilder.makeEventReplacements();

    const entityAggregationOptions = queryBuilder.getEntityAggregationOptions();
    const aggregationOptions = await buildAggregationOptions(
      this.models,
      {}, // No input aggregation for events (yet)
      dataSourceEntities,
      entityAggregationOptions,
      hierarchyId,
    );

    return super.fetchEvents(programCode, queryBuilder.getQuery(), aggregationOptions);
  }
}
