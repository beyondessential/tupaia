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
  name: string;
  legacy: false;
  data: DataObject;
  presentation: PresentationObject;
  permissionGroup: string;
};

export type LegacyDashboardVisualisationObject = {
  id?: string;
  code: string;
  name: string;
  legacy: true;
  data: {
    dataBuilder: string;
    config: LegacyReport['config'];
  };
  presentation: PresentationObject;
};

export type DashboardViz = DashboardVisualisationObject | LegacyDashboardVisualisationObject;

export interface VisualisationValidator {
  validate: (object: DashboardVisualisationObject) => void;
}

export type Dashboard = {
  id: string;
  code: string;
  name: string;
  rootEntityCode: string;
  sortOrder?: number;
};

export type DashboardItem = {
  id: string;
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

export type LegacyReport = {
  code: string;
  dataBuilder: string;
  config: Record<string, unknown>;
  dataServices: { isDataRegional: boolean }[];
};

export type DashboardRecord = CamelKeysToSnake<Dashboard>;

export type DashboardItemRecord = CamelKeysToSnake<DashboardItem>;

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

export type DashboardVisualisationResource = { dashboardItem: DashboardItem; report: Report };

export type LegacyDashboardVisualisationResource = {
  dashboardItem: DashboardItem;
  report: LegacyReport;
};

export type DashboardVizResource =
  | DashboardVisualisationResource
  | LegacyDashboardVisualisationResource;
