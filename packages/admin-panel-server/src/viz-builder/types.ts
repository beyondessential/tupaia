/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { StandardOrCustomReportConfig } from '@tupaia/report-server';
import { Report as BaseReportType } from '@tupaia/types';

export type VizData = {
  dataElements: BaseReportType['config']['fetch']['dataElements'];
  dataGroups: BaseReportType['config']['fetch']['dataGroups'];
  startDate?: BaseReportType['config']['fetch']['startDate'];
  endDate?: BaseReportType['config']['fetch']['endDate'];
  aggregations: BaseReportType['config']['fetch']['aggregations'];
  transform: BaseReportType['config']['transform'];
};

export enum PreviewMode {
  DATA = 'data',
  PRESENTATION = 'presentation',
}

export type Report = {
  code: string;
  permissionGroup: string;
  config: StandardOrCustomReportConfig;
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
