/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  AnalyticResults,
  DataBrokerModelRegistry,
  DataElement,
  DataGroup,
  DataServiceSyncGroup,
  DataSource,
  DataSourceType,
  Diagnostics,
  EventResults,
  DataElementMetadata,
  SyncGroupResults,
  DataGroupMetadata,
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

export abstract class Service {
  protected readonly models: DataBrokerModelRegistry;

  public constructor(models: DataBrokerModelRegistry) {
    this.models = models;
  }

  public get dataSourceTypes() {
    return DATA_SOURCE_TYPES as {
      DATA_ELEMENT: 'dataElement';
      DATA_GROUP: 'dataGroup';
      SYNC_GROUP: 'syncGroup';
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
  ): Promise<AnalyticResults>;

  public abstract pullEvents(
    dataGroups: DataGroup[],
    options: Record<string, unknown>,
  ): Promise<EventResults>;

  public abstract pullSyncGroupResults(
    syncGroups: DataServiceSyncGroup[],
    options: Record<string, unknown>,
  ): Promise<SyncGroupResults>;

  public async pullDataElementMetadata(
    dataElements: DataElement[],
    options: Record<string, unknown>,
  ): Promise<DataElementMetadata[]> {
    // Default behaviour
    return dataElements.map(({ code }) => ({ code }));
  }

  public async pullDataGroupMetadata(
    dataGroup: DataGroup,
    options: Record<string, unknown>,
  ): Promise<DataGroupMetadata> {
    // Default behaviour
    return { code: dataGroup.code };
  }
}
