import { Aggregator as BaseAggregator } from '@tupaia/aggregator';
import { QueryBuilder } from '/dhis/QueryBuilder';

export class Aggregator extends BaseAggregator {
  constructor(dataBroker) {
    super(dataBroker);
    this.checkEntityAccess = () => {
      throw new Error(
        'A "checkEntityAccess" function should be injected before Aggregator is used to fetch data',
      );
    };
  }

  injectCheckEntityAccess(checkEntityAccess) {
    this.checkEntityAccess = checkEntityAccess;
  }

  async fetchAnalytics(dataElementCodes, originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues, this.checkEntityAccess);
    const query = await queryBuilder.build();

    return super.fetchAnalytics(dataElementCodes, query, ...otherParams);
  }
}
