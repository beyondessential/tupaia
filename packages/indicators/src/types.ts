/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
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

type DatabaseType<F extends TypeFields> = BaseDatabaseType & F;

type DbConditions<F extends TypeFields> = Partial<
  Record<keyof F, number | number[] | string | string[]>
>;

interface DatabaseModel<F extends TypeFields, T extends DatabaseType<F>> {
  find: (dbConditions: DbConditions<F>) => Promise<T[]>;
}

export type Indicator = {
  code: string;
  builder: string;
  config: Record<string, unknown>;
};

type IndicatorFields = Indicator & { id: string };

export type IndicatorType = DatabaseType<IndicatorFields>;

export interface ModelRegistry {
  readonly indicator: DatabaseModel<IndicatorFields, IndicatorType>;
}

export interface IndicatorApiInterface {
  getAggregator: () => Aggregator;
  buildAnalyticsForIndicators: (
    indicators: Indicator[],
    fetchOptions: FetchOptions,
  ) => Promise<Analytic[]>;
}

export interface Builder {
  (input: {
    api: IndicatorApiInterface;
    config: IndicatorFields['config'];
    fetchOptions: FetchOptions;
  }): Promise<AnalyticValue[]>;
}

export interface Aggregation {
  readonly type: string;
  readonly config?: Record<string, unknown>;
}

export type FetchOptions = Readonly<Record<string, unknown>>;
