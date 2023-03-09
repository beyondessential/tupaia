/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { DataLakeApi } from '@tupaia/data-lake-api';
import {
  AnalyticResults,
  DataBrokerModelRegistry,
  DataElement,
  DataGroup,
  DataSource,
  DataSourceType,
  EventResults,
} from '../../types';
import type { PullOptions as BasePullOptions } from '../Service';
import { Service } from '../Service';
import { translateOptionsForApi } from './translation';

type PullAnalyticsOptions = BasePullOptions &
  Partial<{
    organisationUnitCodes: string[];
    period: string;
    startDate: string;
    endDate: string;
    dataElementCodes: string[];
    dataGroupCode: string;
    eventId: string;
  }>;

type PullEventsOptions = BasePullOptions &
  Partial<{
    organisationUnitCodes: string[];
    period: string;
    startDate: string;
    endDate: string;
    dataElementCodes: string[];
  }>;

type Puller =
  | ((dataSources: DataElement[], options: PullAnalyticsOptions) => Promise<AnalyticResults>)
  | ((dataSources: DataGroup[], options: PullEventsOptions) => Promise<EventResults>);

// used for internal Tupaia apis: TupaiaDataApi and IndicatorApi
export class DataLakeService extends Service {
  private readonly api: DataLakeApi;
  private readonly pullers: Record<string, Puller>;

  public constructor(models: DataBrokerModelRegistry, api: DataLakeApi) {
    super(models);

    this.api = api;
    this.pullers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents.bind(this),
    };
  }

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in DataLakeService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in DataLakeService');
  }

  public async pull(
    dataSources: DataElement[],
    type: 'dataElement',
    options: PullAnalyticsOptions,
  ): Promise<AnalyticResults>;
  public async pull(
    dataSources: DataGroup[],
    type: 'dataGroup',
    options: PullEventsOptions,
  ): Promise<EventResults>;
  public async pull(dataSources: DataSource[], type: DataSourceType, options: BasePullOptions) {
    const pullData = this.pullers[type];
    return pullData(dataSources as any, options);
  }

  private async pullAnalytics(dataSources: DataElement[], options: PullAnalyticsOptions) {
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

  private async pullEvents(dataSources: DataGroup[], options: PullEventsOptions) {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: dataGroupCode } = dataSource;

    return this.api.fetchEvents({ ...translateOptionsForApi(options), dataGroupCode });
  }
}
