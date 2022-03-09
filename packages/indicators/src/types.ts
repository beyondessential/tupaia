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

export type DataValues = Readonly<Record<string, string | number>>;

export interface Event {
  readonly event: string;
  readonly eventDate: string;
  readonly orgUnit: string;
  readonly orgUnitName: string;
  readonly period: string;
  readonly dataValues: DataValues;
}

export interface AnalyticCluster {
  readonly organisationUnit: Analytic['organisationUnit'];
  readonly period: Analytic['period'];
  readonly dataValues: Record<Analytic['dataElement'], Analytic['value'] | string>;
}

type DbValue = string | number | boolean | null | DbValue[] | { [key: string]: DbValue };

export type DbRecord = Record<string, DbValue>;

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

type DataSourceModel = DatabaseModel<DataSourceRecord>;

export interface ModelRegistry {
  readonly dataSource: DataSourceModel;
  readonly indicator: DatabaseModel<IndicatorRecord>;
}

export interface Aggregation {
  readonly type: string;
  readonly config?: Record<string, unknown>;
}

export type AggregationList = Aggregation[];

export type FetchOptions = Readonly<{
  readonly organisationUnit?: string;
  readonly organisationUnitCodes?: string[];
  readonly startDate: string;
  readonly endDate: string;
  readonly period?: string;
}>;
