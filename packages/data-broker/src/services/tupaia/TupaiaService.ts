/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import type { TupaiaDataApi } from '@tupaia/data-api';
import { reduceToDictionary } from '@tupaia/utils';
import {
  AnalyticResults,
  DataBrokerModelRegistry,
  DataElement,
  DataElementMetadata,
  DataGroup,
  DataGroupMetadata,
  DataSource,
  DataSourceType,
  EventResults,
} from '../../types';
import { Service } from '../Service';
import { translateOptionsForApi } from './translation';

export type PullAnalyticsOptions = Partial<{
  period: string;
  startDate: string;
  endDate: string;
  includeOptions: boolean;
}>;

export type PullEventsOptions = Partial<{
  period: string;
  startDate: string;
  endDate: string;
}>;

type PullMetadataOptions = {
  includeOptions?: boolean;
};

type Puller =
  | ((dataSources: DataElement[], options: PullAnalyticsOptions) => Promise<AnalyticResults>)
  | ((dataSources: DataGroup[], options: PullEventsOptions) => Promise<EventResults>);

type MetadataPuller =
  | ((dataSources: DataElement[], options: PullMetadataOptions) => Promise<DataElementMetadata[]>)
  | ((dataSources: DataGroup[], options: PullMetadataOptions) => Promise<DataGroupMetadata>);

// used for internal Tupaia apis: TupaiaDataApi and IndicatorApi
export class TupaiaService extends Service {
  private readonly api: TupaiaDataApi;
  private readonly pullers: Record<string, Puller>;
  private readonly metadataPullers: Record<string, MetadataPuller>;

  public constructor(models: DataBrokerModelRegistry, api: TupaiaDataApi) {
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

  public async push(): Promise<never> {
    throw new Error('Data push is not supported in TupaiaService');
  }

  public async delete(): Promise<never> {
    throw new Error('Data deletion is not supported in TupaiaService');
  }

  public async pull(
    dataSources: DataElement[],
    type: 'dataElement',
    options?: PullAnalyticsOptions,
  ): Promise<AnalyticResults>;
  public async pull(
    dataSources: DataGroup[],
    type: 'dataGroup',
    options?: PullEventsOptions,
  ): Promise<EventResults>;
  public async pull(
    dataSources: DataSource[],
    type: DataSourceType,
    options: Record<string, unknown> = {},
  ) {
    const pullData = this.pullers[type];
    return pullData(dataSources as any, options);
  }

  private async pullAnalytics(dataSources: DataElement[], options: PullAnalyticsOptions) {
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

  private async pullEvents(dataSources: DataGroup[], options: PullEventsOptions) {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: dataGroupCode } = dataSource;

    return this.api.fetchEvents({ ...translateOptionsForApi(options), dataGroupCode });
  }

  public async pullMetadata(
    dataSources: DataElement[],
    type: 'dataElement',
    options?: PullMetadataOptions,
  ): Promise<DataElementMetadata[]>;
  public async pullMetadata(
    dataSources: DataGroup[],
    type: 'dataGroup',
    options?: PullMetadataOptions,
  ): Promise<DataGroupMetadata>;
  public async pullMetadata(
    dataSources: DataSource[],
    type: DataSourceType,
    options: PullMetadataOptions = {},
  ) {
    const pullMetadata = this.metadataPullers[type];
    return pullMetadata(dataSources as any, options);
  }

  private async pullDataElementMetadata(dataSources: DataElement[], options: PullMetadataOptions) {
    const { includeOptions } = options;
    const dataElementCodes = dataSources.map(({ code }) => code);
    return this.api.fetchDataElements(dataElementCodes, { includeOptions });
  }

  private async pullDataGroupMetadata(dataSources: DataGroup[], options: PullMetadataOptions) {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull metadata from multiple programs at the same time');
    }
    const { includeOptions } = options;
    const [dataSource] = dataSources;
    const { code: dataGroupCode } = dataSource;
    const dataElementDataSources = await this.models.dataGroup.getDataElementsInDataGroup(
      dataGroupCode,
    );
    const dataElementCodes = dataElementDataSources.map(({ code }) => code);
    return this.api.fetchDataGroup(dataGroupCode, dataElementCodes, { includeOptions });
  }
}
