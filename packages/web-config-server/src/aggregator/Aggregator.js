import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from '/dhis/QueryBuilder';

export class Aggregator extends BaseAggregator {
  async fetchAnalytics(dataElementCodes, originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
    const query = queryBuilder.build();
    const ans = await super.fetchAnalytics(dataElementCodes, query, ...otherParams);
    console.log(ans);
    return ans;
  }
}
