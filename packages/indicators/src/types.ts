/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseType as BaseDatabaseType } from '@tupaia/database';

export interface AnalyticValue {
  readonly organisationUnit: string;
  readonly period: string;
  readonly value: number;
}

export interface Analytic extends AnalyticValue {
  readonly dataElement: string;
}

export interface AnalyticCluster {
  organisationUnit: Analytic['organisationUnit'];
  period: Analytic['period'];
  dataValues: Record<Analytic['dataElement'], Analytic['value']>;
}

type TypeFields = Record<string, string | number | Record<string, unknown>>;

type DatabaseType<T extends TypeFields> = BaseDatabaseType & T;

type DbConditions<T extends TypeFields> = Partial<
  Record<keyof T, number | number[] | string | string[]>
>;

interface DatabaseModel<T extends TypeFields> {
  find: (dbConditions: DbConditions<T>) => Promise<DatabaseType<T>[]>;
}

export type Indicator = {
  code: string;
  builder: string;
  config: Record<string, unknown>;
};

type IndicatorFields = Indicator & { id: string };

type DataSourceFields = {
  id: string;
  code: string;
  type: 'dataElement' | 'dataGroup';
  service_type: 'dhis' | 'indicator' | 'tupaia' | 'weather';
  config: Record<string, unknown>;
};

export type DataSourceType = DatabaseType<DataSourceFields>;

export type IndicatorType = DatabaseType<IndicatorFields>;

type DataSourceModel = DatabaseModel<DataSourceFields> & {
  findOrDefault: DatabaseModel<DataSourceFields>['find'];
};

export interface ModelRegistry {
  readonly dataSource: DataSourceModel;
  readonly indicator: DatabaseModel<IndicatorFields>;
}

export interface Aggregation {
  readonly type: string;
  readonly config?: Record<string, unknown>;
}

export type FetchOptions = Readonly<{ startDate: string; endDate: string; period?: string }>;
