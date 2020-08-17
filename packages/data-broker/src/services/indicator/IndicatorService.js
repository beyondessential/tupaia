/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';

export class IndicatorService extends Service {
  constructor(models, api) {
    super(models);

    this.api = api;
    this.pullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents.bind(this),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async push() {
    throw new Error('Data push is not supported in IndicatorService');
  }

  // eslint-disable-next-line class-methods-use-this
  async delete() {
    throw new Error('Data deletion is not supported in IndicatorService');
  }

  async pull(dataSources, type) {
    const pullData = this.pullers[type];
    return pullData(dataSources);
  }

  async pullAnalytics(dataSources, options) {
    const indicatorCodes = dataSources.map(({ code }) => code);

    return {
      results: await this.api.buildAnalytics(indicatorCodes, options),
      metadata: { dataElementCodeToName: {} },
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async pullEvents() {
    throw new Error('Event pulling is not supported in IndicatorService');
  }

  // eslint-disable-next-line class-methods-use-this
  async pullMetadata() {
    throw new Error('Metadata pulling is not supported in IndicatorService');
  }
}
