/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { reduceToDictionary } from '@tupaia/utils';

import { Service } from '../Service';
import { translateOptionsForApi } from './translation';

// used for internal Tupaia apis: TupaiaDataApi and IndicatorApi
export class TupaiaService extends Service {
  constructor(models, api) {
    super(models);

    this.api = api;
    this.pullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents.bind(this),
    };
    this.metadataPullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullDataElementMetadata.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullDataGroupMetadata.bind(this),
    };
  }

  async push() {
    throw new Error('Data push is not supported in TupaiaService');
  }

  async delete() {
    throw new Error('Data deletion is not supported in TupaiaService');
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
    const dataElements = await this.pullDataElementMetadata(dataSources, options);

    return {
      results: analytics,
      metadata: {
        dataElementCodeToName: reduceToDictionary(dataElements, 'code', 'name'),
      },
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

  async pullMetadata(dataSources, type, options = {}) {
    const pullMetadata = this.metadataPullers[type];
    return pullMetadata(dataSources, options);
  }

  async pullDataElementMetadata(dataSources, options) {
    const { includeOptions } = options;
    const dataElementCodes = dataSources.map(({ code }) => code);
    return this.api.fetchDataElements(dataElementCodes, { includeOptions });
  }

  async pullDataGroupMetadata(dataSources, options) {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull metadata from multiple programs at the same time');
    }
    const { includeOptions } = options;
    const [dataSource] = dataSources;
    const { code: dataGroupCode } = dataSource;
    const dataElementDataSources = await this.models.dataSource.getDataElementsInGroup(
      dataGroupCode,
    );
    const dataElementCodes = dataElementDataSources.map(({ code }) => code);
    return this.api.fetchDataGroup(dataGroupCode, dataElementCodes, { includeOptions });
  }
}
