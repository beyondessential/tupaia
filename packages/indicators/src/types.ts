import { DatabaseRecord as BaseDatabaseRecord } from '@tupaia/database';

export interface AnalyticValue {
  readonly organisationUnit: string;
  readonly period: string;
  readonly value: string | number;
}

// TODO: move to @tupaia/types, same type as for data-broker
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
  readonly organisationUnit: string;
  readonly period: string;
  readonly dataValues: Record<string, number | string>;
}

type DbValue = string | number | boolean | null | DbValue[] | { [key: string]: DbValue };

export type DbRecord = Record<string, DbValue>;

type DatabaseRecord<T extends DbRecord> = BaseDatabaseRecord & T;

type DbConditions<T extends DbRecord> = Partial<
  Record<keyof T, number | number[] | string | string[]>
>;

interface DatabaseModel<T extends DbRecord> {
  find: (dbConditions: DbConditions<T>) => Promise<DatabaseRecord<T>[]>;
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

export type DataSourceType = DatabaseRecord<DataSourceRecord>;

export type IndicatorType = DatabaseRecord<IndicatorRecord>;

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

export type DataBroker = unknown;
