import type { TupaiaDataApi } from '@tupaia/data-api';
import { reduceToDictionary } from '@tupaia/utils';
import {
  DataBrokerModelRegistry,
  DataElement,
  DataElementMetadata,
  DataGroup,
  DataGroupMetadata,
  DataSource,
  DataSourceType,
} from '../../types';
import { DataServiceMapping } from '../DataServiceMapping';
import { Service } from '../Service';
import type { PullMetadataOptions as BasePullMetadataOptions } from '../Service';
import { translateOptionsForApi } from './translation';

type PullAnalyticsOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCodes?: string[];
  period?: string;
  startDate?: string;
  endDate?: string;
  includeOptions?: boolean;
};

type PullEventsOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCodes?: string[];
  period?: string;
  startDate?: string;
  endDate?: string;
};

type PullMetadataOptions = BasePullMetadataOptions & {
  includeOptions?: boolean;
};

type MetadataPuller =
  | ((dataSources: DataElement[], options: PullMetadataOptions) => Promise<DataElementMetadata[]>)
  | ((dataSources: DataGroup[], options: PullMetadataOptions) => Promise<DataGroupMetadata>);

// used for internal Tupaia apis: TupaiaDataApi and IndicatorApi
export class TupaiaService extends Service {
  private readonly api: TupaiaDataApi;
  private readonly metadataPullers: Record<string, MetadataPuller>;

  public constructor(models: DataBrokerModelRegistry, api: TupaiaDataApi) {
    super(models);

    this.api = api;
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

  public async pullAnalytics(dataElements: DataElement[], options: PullAnalyticsOptions) {
    const dataElementCodes = dataElements.map(({ code }) => code);
    const { analytics, numAggregationsProcessed } = await this.api.fetchAnalytics({
      ...translateOptionsForApi(options),
      dataElementCodes,
    });
    const namedDataElements = await this.pullDataElementMetadata(dataElements, options);

    return {
      results: analytics,
      metadata: {
        dataElementCodeToName: reduceToDictionary(namedDataElements, 'code', 'name'),
      },
      numAggregationsProcessed,
    };
  }

  public async pullEvents(dataGroups: DataGroup[], options: PullEventsOptions) {
    if (dataGroups.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataGroup] = dataGroups;
    const { code: dataGroupCode } = dataGroup;

    return this.api.fetchEvents({ ...translateOptionsForApi(options), dataGroupCode });
  }

  public async pullSyncGroupResults(): Promise<never> {
    throw new Error('pullSyncGroupResults is not supported in TupaiaService');
  }

  public async pullMetadata(
    dataSources: DataElement[],
    type: 'dataElement',
    options: PullMetadataOptions,
  ): Promise<DataElementMetadata[]>;
  public async pullMetadata(
    dataSources: DataGroup[],
    type: 'dataGroup',
    options: PullMetadataOptions,
  ): Promise<DataGroupMetadata>;
  public async pullMetadata(
    dataSources: DataSource[],
    type: DataSourceType,
    options: PullMetadataOptions,
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
