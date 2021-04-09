/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { AGGREGATION_TYPES } from '@tupaia/aggregator/dist/aggregationTypes';


export class LatestDataValueBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);
    const [ result ] = results;
    return { value: result.value };
  }
}

export const latestDataValue = async ({ models, dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new LatestDataValueBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    AGGREGATION_TYPES.MOST_RECENT,
  );
  return builder.build();
};
