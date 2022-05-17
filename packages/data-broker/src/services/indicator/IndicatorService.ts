/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { FetchOptions as PullIndicatorsOptions, IndicatorApi } from '@tupaia/indicators';
import {
  AnalyticResults,
  DataBrokerModelRegistry,
  DataElement,
  DataSource,
  DataSourceType,
} from '../../types';
import { Service } from '../Service';

export class IndicatorService extends Service {
  private readonly api: IndicatorApi;

  public constructor(models: DataBrokerModelRegistry, api: IndicatorApi) {
    super(models);

    this.api = api;
  }

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in IndicatorService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in IndicatorService');
  }

  public async pull(
    dataSources: DataElement[],
    type: 'dataElement',
    options: PullIndicatorsOptions,
  ): Promise<AnalyticResults>;
  public async pull(
    dataSources: DataSource[],
    type: DataSourceType,
    options: Record<string, unknown>,
  ): Promise<AnalyticResults | never> {
    switch (type) {
      case this.dataSourceTypes.DATA_ELEMENT:
        return this.pullAnalytics(dataSources as DataElement[], options as PullIndicatorsOptions);
      case this.dataSourceTypes.DATA_GROUP:
        throw new Error('Event pulling is not supported in IndicatorService');
      case this.dataSourceTypes.SYNC_GROUP:
        throw new Error('Sync Group pulling is not supported in IndicatorService');
      default:
        throw new Error('Unexpected data source type');
    }
  }

  private async pullAnalytics(dataSources: DataElement[], options: PullIndicatorsOptions) {
    const indicatorCodes = dataSources.map(({ code }) => code);

    return {
      results: await this.api.buildAnalytics(indicatorCodes, options),
      // TODO: either implement properly in #tupaia-backlog/1153,
      // or remove entirely in #tupaia-backlog/issues/1154
      metadata: { dataElementCodeToName: {} },
    };
  }

  public async pullMetadata(dataSources: DataSource[]) {
    // TODO: Implement properly in #tupaia-backlog/issues/2137
    return dataSources.map(dataSource => ({ code: dataSource.code, name: undefined }));
  }
}
