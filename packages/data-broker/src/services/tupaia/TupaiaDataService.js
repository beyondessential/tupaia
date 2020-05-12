/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';

import { Service } from '../Service';

export class TupaiaDataService extends Service {
  constructor(models, api) {
    super(models);

    this.api = api;
    this.pullers = this.getPullers();
    this.metadataPullers = this.getMetadataPullers();
  }

  getPullers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents.bind(this),
    };
  }

  getMetadataPullers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullDataElementMetadata.bind(this),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  async push() {
    throw new Error('Data push is not supported in TupaiaDataService');
  }

  // eslint-disable-next-line class-methods-use-this
  async delete() {
    throw new Error('Data deletion is not supported in TupaiaDataService');
  }

  async pull(dataSources, type, options = {}) {
    const pullData = this.pullers[type];
    return pullData(dataSources, options);
  }

  async pullAnalytics(dataSources, options) {
    const dataElementCodes = dataSources.map(({ code }) => code);
    const analytics = await this.api.getAnalytics({ ...options, dataElementCodes });
    const dataElements = await this.pullDataElementMetadata(dataSources);

    return {
      results: analytics,
      metadata: {
        dataElementCodeToName: reduceToDictionary(dataElements, 'code', 'name'),
      },
    };
  }

  async pullEvents(dataSources, options) {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: programCode } = dataSource;

    return this.api.getEvents({ ...options, programCode });
  }

  async pullMetadata(dataSources, type) {
    const pullMetadata = this.metadataPullers[type];
    return pullMetadata(dataSources);
  }

  async pullDataElementMetadata(dataSources) {
    const dataElementCodes = dataSources.map(({ code }) => code);
    return this.api.fetchDataElements(dataElementCodes);
  }
}
