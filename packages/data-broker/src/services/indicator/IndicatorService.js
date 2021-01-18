/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';

export class IndicatorService extends Service {
  constructor(models, api) {
    super(models);

    this.api = api;
  }

  async push() {
    throw new Error('Data push is not supported in IndicatorService');
  }

  async delete() {
    throw new Error('Data deletion is not supported in IndicatorService');
  }

  async pull(dataSources, type, options) {
    if (type === this.dataSourceTypes.DATA_GROUP) {
      throw new Error('Event pulling is not supported in IndicatorService');
    }
    return this.pullAnalytics(dataSources, options);
  }

  async pullAnalytics(dataSources, options) {
    const indicatorCodes = dataSources.map(({ code }) => code);

    return {
      results: await this.api.buildAnalytics(indicatorCodes, options),
      // TODO: either implement properly in #tupaia-backlog/1153,
      // or remove entirely in #tupaia-backlog/issues/1154
      metadata: { dataElementCodeToName: {} },
    };
  }

  async pullMetadata(dataSources) {
    return dataSources.map(dataSource => ({ code: dataSource.code, name: undefined }));
  }
}
