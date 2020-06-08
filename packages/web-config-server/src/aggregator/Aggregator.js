import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from './QueryBuilder';

export class Aggregator extends BaseAggregator {
  constructor(dataBroker, fetchDataSourceEntities) {
    super(dataBroker);
    this.fetchDataSourceEntities = fetchDataSourceEntities;
  }

  async fetchAnalytics(dataElementCodes, originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(
      originalQuery,
      replacementValues,
      this.fetchDataSourceEntities,
    );
    const query = await queryBuilder.build();

    return super.fetchAnalytics(dataElementCodes, query, ...otherParams);
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
