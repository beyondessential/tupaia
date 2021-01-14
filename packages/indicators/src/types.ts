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

type DbValue = string | number | boolean | DbValue[] | { [key: string]: DbValue };

type DbRecord = Record<string, DbValue>;

type DatabaseType<T extends DbRecord> = BaseDatabaseType & T;

type DbConditions<T extends DbRecord> = Partial<
  Record<keyof T, number | number[] | string | string[]>
>;

interface DatabaseModel<T extends DbRecord> {
  find: (dbConditions: DbConditions<T>) => Promise<DatabaseType<T>[]>;
}

export type Indicator = {
  code: string;
  builder: string;
  config: { [key: string]: DbValue };
};

type IndicatorRecord = Indicator & { id: string };

type DataSourceRecord = {
  id: string;
  code: string;
  type: 'dataElement' | 'dataGroup';
  service_type: 'dhis' | 'indicator' | 'tupaia' | 'weather';
  config: Record<string, DbValue>;
};

export type DataSourceType = DatabaseType<DataSourceRecord>;

export type IndicatorType = DatabaseType<IndicatorRecord>;

type DataSourceModel = DatabaseModel<DataSourceRecord> & {
  findOrDefault: DatabaseModel<DataSourceRecord>['find'];
};

export interface ModelRegistry {
  readonly dataSource: DataSourceModel;
  readonly indicator: DatabaseModel<IndicatorRecord>;
}

export interface Aggregation {
  readonly type: string;
  readonly config?: Record<string, unknown>;
}

export type FetchOptions = Readonly<{
  organisationUnit?: string;
  organisationUnitCodes?: string[];
  startDate: string;
  endDate: string;
  period?: string;
}>;
