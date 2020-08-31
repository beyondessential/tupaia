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

type TypeFields = Record<string, string | number | {}>;

type DatabaseType<F extends TypeFields> = BaseDatabaseType & F;

type DbConditions<F extends TypeFields> = Partial<
  Record<keyof F, number | number[] | string | string[]>
>;

interface DatabaseModel<F extends TypeFields, T extends DatabaseType<F>> {
  find: (dbConditions: DbConditions<F>) => Promise<T[]>;
}

export type IndicatorFields = {
  id: string;
  code: string;
  builder: string;
  config: Record<string, unknown>;
};

export type IndicatorType = DatabaseType<IndicatorFields>;

export interface ModelRegistry {
  readonly indicator: DatabaseModel<IndicatorFields, IndicatorType>;
}

export interface Builder {
  (input: {
    aggregator: Aggregator;
    config: IndicatorFields['config'];
    fetchOptions: FetchOptions;
  }): Promise<AnalyticValue[]>;
}

export interface Aggregation {
  readonly type: string;
  readonly config?: Record<string, unknown>;
}

/**
 * Used to define the aggregation(s) that should be used for each data element in an indicator.
 */
export type AggregationSpecs = Readonly<Record<string, string | string[]>>;

export type FetchOptions = Readonly<Record<string, unknown>>;
