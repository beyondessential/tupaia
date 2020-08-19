/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { DatabaseType } from '@tupaia/database';

export interface Analytic {
  readonly dataElement: string;
  readonly organisationUnit: string;
  readonly period: string;
  readonly value: number;
}

export interface IndicatorType extends DatabaseType {
  id: string;
  code: string;
  builder: string;
  config: Record<string, unknown>;
}

interface DatabaseModel<T> {
  find: (dbConditions: Record<string, unknown>) => Promise<T[]>;
}

export interface ModelRegistry {
  readonly indicator: DatabaseModel<IndicatorType>;
}

export interface Builder<C extends {}> {
  (input: { aggregator: Aggregator; config: C; fetchOptions: FetchOptions }): Promise<Analytic[]>;
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
