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
  SyncGroupResults,
} from '../types';

export abstract class Service {
  protected readonly models: DataBrokerModelRegistry;

  public constructor(models: DataBrokerModelRegistry) {
    this.models = models;
  }

  public get dataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  public abstract push(
    dataSources: DataSource[],
    data: unknown,
  ): Promise<{ diagnostics: Diagnostics }>;

  public abstract delete(
    dataSource: DataSource,
    data: unknown,
    options?: Record<string, unknown>,
  ): Promise<Diagnostics>;

  public abstract pull(
    dataSources: DataSource[],
    type: DataSourceType,
    options?: Record<string, unknown>,
  ): Promise<AnalyticResults | EventResults | SyncGroupResults | undefined> | never;

  public abstract pullMetadata(
    dataSources: DataSource[],
    type: DataSourceType,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
}
