import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from './QueryBuilder';
import { ResponseBuilder } from './ResponseBuilder';

export class Aggregator extends BaseAggregator {
  constructor(dataBroker, routeHandler) {
    super(dataBroker);
    this.routeHandler = routeHandler;
  }

  async fetchAnalytics(dataElementCodes, originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues, this.routeHandler);
    const query = await queryBuilder.build();
    const analytics = await super.fetchAnalytics(dataElementCodes, query, ...otherParams);

    const responseBuilder = new ResponseBuilder(analytics, 'analytics', this.routeHandler);

    return responseBuilder.build();
  }

  async fetchEvents(programCode, originalQuery, replacementValues) {
    const queryBuilder = new QueryBuilder(
      originalQuery,
      replacementValues,
      this.fetchDataSourceEntities,
    );
    await queryBuilder.fetchAndReplaceOrgUnitCodes();
    queryBuilder.makeEventReplacements();

    return super.fetchEvents(programCode, queryBuilder.query);
  }
}
