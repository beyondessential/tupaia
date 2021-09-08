/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

type AggregationObject = {
  readonly type: string;
  readonly config?: Record<string, unknown>;
};

type Aggregation = string | AggregationObject;

type Transform = Record<string, unknown>;

type DataObject = {
  dataElements: string[];
  dataGroups: string[];
  aggregations: Aggregation[];
  transform: Transform[];
};

type VizType = 'view' | 'chart' | 'matrix';

type PresentationObject = Record<string, unknown> & {
  readonly type: VizType;
  readonly output: Record<string, unknown>;
};

export enum PreviewMode {
  DATA = 'data',
  PRESENTATION = 'presentation',
}

export type DashboardVisualisationObject = {
  id?: string;
  code: string;
  name?: string;
  permissionGroup: string;
  data: DataObject;
  presentation: PresentationObject;
};

export interface VisualisationValidator {
  validate: (object: DashboardVisualisationObject) => void;
}

export type DashboardItem = {
  code: string;
  config: { name?: string } & { type: VizType } & Record<string, unknown>;
  reportCode: string;
  legacy: boolean;
};

export type Report = {
  code: string;
  permissionGroup: string;
  config: ReportConfig;
};

export type Dashboard = {
  code: string;
  name: string;
  rootEntityCode: string;
  sortOrder?: number;
};

export type DashboardRecord = CamelKeysToSnake<Dashboard> & { id: string };

export type DashboardItemRecord = CamelKeysToSnake<DashboardItem> & { id: string };

export type DashboardRelationRecord = {
  id: string;
  dashboard_id: string;
  child_id: string;
  entity_types: string[];
  project_codes: string[];
  permission_groups: string[];
  sort_order?: number;
};

export type DashboardRelationObject = {
  dashboardCode: string;
  entityTypes: string[];
  projectCodes: string[];
  permissionGroups: string[];
  sortOrder?: number;
};

export type ReportRecord = CamelKeysToSnake<Report> & { id: string };

type FetchConfig = {
  dataElements: string[];
  dataGroups: string[];
  aggregations: Aggregation[];
};

type ReportConfig = {
  fetch: FetchConfig;
  transform: Transform[];
  output: Record<string, unknown>;
};

type CamelToSnake<T extends string> = T extends `${infer Char}${infer Rest}`
  ? `${Char extends Uppercase<Char> ? '_' : ''}${Lowercase<Char>}${CamelToSnake<Rest>}`
  : '';

export type CamelKeysToSnake<T extends Record<string, unknown>> = {
  [K in keyof T as CamelToSnake<Extract<K, string>>]: T[K];
};

export type DashboardVisualisationResource = {
  dashboardItem: DashboardItemRecord;
  report: ReportRecord;
};
