import {
  RawAnalyticResults,
  DataBrokerModelRegistry,
  DataElement,
  DataGroup,
  DataSource,
  DataSourceType,
  Diagnostics,
  EventResults,
} from '../types';
import { DATA_SOURCE_TYPES } from '../utils';
import { DataServiceMapping } from './DataServiceMapping';

export type PushOptions = {
  type: DataSourceType;
  dataServiceMapping: DataServiceMapping;
};

export type DeleteOptions = {
  type: DataSourceType;
  dataServiceMapping: DataServiceMapping;
};

export type PullMetadataOptions = {
  dataServiceMapping: DataServiceMapping;
};

export abstract class Service {
  protected readonly models: DataBrokerModelRegistry;

  public constructor(models: DataBrokerModelRegistry) {
    this.models = models;
  }

  public get dataSourceTypes() {
    return DATA_SOURCE_TYPES as {
      DATA_ELEMENT: 'dataElement';
      DATA_GROUP: 'dataGroup';
    };
  }

  public abstract push(
    dataSources: DataSource[],
    data: unknown,
    options: PushOptions,
  ): Promise<{ diagnostics: Diagnostics }>;

  public abstract delete(
    dataSource: DataSource,
    data: unknown,
    options: DeleteOptions,
  ): Promise<Diagnostics>;

  public abstract pullAnalytics(
    dataElements: DataElement[],
    options: Record<string, unknown>,
  ): Promise<RawAnalyticResults>;

  public abstract pullEvents(
    dataGroups: DataGroup[],
    options: Record<string, unknown>,
  ): Promise<EventResults>;

  /**
   * The default pullMetadata behaviour is to return no metadata
   */
  public async pullMetadata(
    dataSources: DataSource[],
    // @ts-ignore
    type: DataSourceType,
    // @ts-ignore
    options: PullMetadataOptions,
  ): Promise<{ code: string }[]> {
    return dataSources.map(ds => ({ code: ds.code }));
  }
}
