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
    switch (type) {
      case this.dataSourceTypes.DATA_ELEMENT:
        return this.pullAnalytics(dataSources, options);
      case this.dataSourceTypes.DATA_GROUP:
        throw new Error('Event pulling is not supported in IndicatorService');
      case this.dataSourceTypes.SYNC_GROUP:
        throw new Error('Sync Group pulling is not supported in IndicatorService');
      default:
        throw new Error('Unexpected data source type');
    }
  }

  async pullAnalytics(dataSources, options) {
    const indicatorCodes = dataSources.map(({ code }) => code);

    return {
      results: await this.api.buildAnalytics(indicatorCodes, options),
      // TODO: either implement properly in #NOT-521 or remove entirely in #NOT-522
      metadata: { dataElementCodeToName: {} },
    };
  }

  async pullMetadata(dataSources) {
    // TODO: Implement properly in #tupaia-backlog/issues/2137
    return dataSources.map(dataSource => ({ code: dataSource.code, name: undefined }));
  }
}
