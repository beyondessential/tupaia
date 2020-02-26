import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from '/dhis/QueryBuilder';

export class Aggregator extends BaseAggregator {
  async fetchAnalytics(dataElementCodes, originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
    const query = queryBuilder.makeDimensionReplacements();

    return super.fetchAnalytics(dataElementCodes, query, ...otherParams);
  }
}
