/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  AnalyticResults,
  DataBrokerModelRegistry,
  DataSource,
  DataSourceType,
  Diagnostics,
  EventResults,
  Metadata,
  SyncGroupResults,
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

export type PullOptions = {
  dataServiceMapping: DataServiceMapping;
  organisationUnitCodes?: string[];
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

  public abstract pull(
    dataSources: DataSource[],
    type: DataSourceType,
    options: PullOptions,
  ): Promise<AnalyticResults | EventResults | SyncGroupResults> | never;

  /**
   * The default pullMetadata behaviour is to return no metadata
   */
  public async pullMetadata(
    dataSources: DataSource[],
    type: DataSourceType,
    options: PullMetadataOptions,
  ): Promise<Metadata[]> {
    return dataSources.map(ds => ({ code: ds.code }));
  }
}
