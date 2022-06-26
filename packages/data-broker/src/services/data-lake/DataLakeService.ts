/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { translateOptionsForApi } from './translation';

// used for internal Tupaia apis: TupaiaDataApi and IndicatorApi
export class DataLakeService extends Service {
  constructor(models, api) {
    super(models);

    this.api = api;
    this.pullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents.bind(this),
    };
  }

  async push() {
    throw new Error('Data push is not supported in DataLakeService');
  }

  async delete() {
    throw new Error('Data deletion is not supported in DataLakeService');
  }

  async pull(dataSources, type, options = {}) {
    const pullData = this.pullers[type];
    return pullData(dataSources, options);
  }

  async pullAnalytics(dataSources, options) {
    const dataElementCodes = dataSources.map(({ code }) => code);
    const { analytics, numAggregationsProcessed } = await this.api.fetchAnalytics({
      ...translateOptionsForApi(options),
      dataElementCodes,
    });

    return {
      results: analytics,
      metadata: {},
      numAggregationsProcessed,
    };
  }

  async pullEvents(dataSources, options) {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: dataGroupCode } = dataSource;

    return this.api.fetchEvents({ ...translateOptionsForApi(options), dataGroupCode });
  }

  async pullMetadata(dataSources) {
    return dataSources.map(dataSource => ({ code: dataSource.code, name: undefined }));
  }
}
