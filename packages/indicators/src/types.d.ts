/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Aggregator } from '@tupaia/aggregator';
import { DatabaseModel, DatabaseType } from '@tupaia/database';

export interface Analytic {
  dataElement: string;
  organisationUnit: string;
  period: string;
  value: number;
}

export interface IndicatorType extends DatabaseType {
  id: string;
  code: string;
  builder: string;
  config: Record<string, unknown>;
}

export interface IndicatorModel extends DatabaseModel {
  find: (dbConditions: Record<string, unknown>) => Promise<IndicatorType[]>;
}

export interface ModelRegistry {
  indicator: IndicatorModel;
}

export interface Builder<C extends {}> {
  (input: { aggregator: Aggregator; config: C; fetchOptions: FetchOptions }): Promise<Analytic[]>;
}

export interface Aggregation {
  type: string;
  config?: Record<string, unknown>;
}

/**
 * Used to define the aggregation(s) that should be used for each data element in an indicator.
 */
export type AggregationSpecs = Record<string, string | string[]>;

export type FetchOptions = Record<string, unknown>;
