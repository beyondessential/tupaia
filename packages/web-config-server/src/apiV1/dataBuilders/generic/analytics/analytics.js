/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { addNameToDataElementResult } from 'apiV1/utils/addNameToDataElementResult';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class AnalyticsBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes } = this.config;
    const { results, metadata } = await this.fetchAnalytics(dataElementCodes);
    if (this.config.withName === true) {
      const { dataElementCodeToName } = metadata;
      const resultsWithName = addNameToDataElementResult(results, dataElementCodeToName);
      return { data: resultsWithName };
    }
    return { data: results };
  }
}

export const analytics = ({ models, dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const { aggregationType } = dataBuilderConfig;
  const builder = new AnalyticsBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};
