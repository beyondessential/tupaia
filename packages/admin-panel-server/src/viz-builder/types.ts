/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import type { ReportConfig } from '@tupaia/report-server';

export type VizData = {
  dataElements: ReportConfig['fetch']['dataElements'];
  dataGroups: ReportConfig['fetch']['dataGroups'];
  startDate?: ReportConfig['fetch']['startDate'];
  endDate?: ReportConfig['fetch']['endDate'];
  aggregations: ReportConfig['fetch']['aggregations'];
  transform: ReportConfig['transform'];
};

export enum PreviewMode {
  DATA = 'data',
  PRESENTATION = 'presentation',
}

export type Report = {
  code: string;
  permissionGroup: string;
  config: ReportConfig;
};

export type LegacyReport = {
  code: string;
  dataBuilder: string;
  config: Record<string, unknown>;
  dataServices: { isDataRegional: boolean }[];
};

export type ReportRecord = CamelKeysToSnake<Report> & { id: string };

type CamelToSnake<T extends string> = T extends `${infer Char}${infer Rest}`
  ? `${Char extends Uppercase<Char> ? '_' : ''}${Lowercase<Char>}${CamelToSnake<Rest>}`
  : '';

export type CamelKeysToSnake<T extends Record<string, unknown>> = {
  [K in keyof T as CamelToSnake<Extract<K, string>>]: T[K];
};

// expands object types recursively
// TODO: Move this type to a generic @tupaia/utils-ts package
export type ExpandType<T> = T extends Record<string, unknown>
  ? T extends infer O
    ? {
      [K in keyof O]: ExpandType<O[K]>;
    }
    : never
  : T;
