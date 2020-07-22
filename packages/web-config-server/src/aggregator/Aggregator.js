import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from './QueryBuilder';
import { buildAggregationOptions } from './buildAggregationOptions';
import { Project } from '/models';

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
    const hierarchyId = (await Project.findOne({ code: this.routeHandler.query.projectCode }))
      .entity_hierarchy_id;

    const fetchOptions = await queryBuilder.build(dataSourceEntities);

    const entityAggregationOptions = queryBuilder.getEntityAggregationOptions();
    const aggregationOptions = await buildAggregationOptions(
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
    const hierarchyId = (await Project.findOne({ code: this.routeHandler.query.projectCode }))
      .entity_hierarchy_id;

    queryBuilder.replaceOrgUnitCodes(dataSourceEntities);
    queryBuilder.makeEventReplacements();

    const entityAggregationOptions = queryBuilder.getEntityAggregationOptions();
    const aggregationOptions = await buildAggregationOptions(
      {}, // No input aggregation for events (yet)
      dataSourceEntities,
      entityAggregationOptions,
      hierarchyId,
    );

    return super.fetchEvents(programCode, queryBuilder.getQuery(), aggregationOptions);
  }
}
