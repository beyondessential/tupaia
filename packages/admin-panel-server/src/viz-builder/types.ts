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

type VizData = {
  dataElements: string[];
  dataGroups: string[];
  aggregations: Aggregation[];
  transform: Transform[];
};

type VizType = 'view' | 'chart' | 'matrix';

type Presentation = Record<string, unknown> & {
  readonly type: VizType;
  readonly output: Record<string, unknown>;
};

export enum PreviewMode {
  DATA = 'data',
  PRESENTATION = 'presentation',
}

type DashboardVisualisation = {
  id?: string;
  code: string;
  name: string;
  legacy: false;
  data: VizData;
  presentation: Presentation;
  permissionGroup: string;
};

type LegacyDashboardVisualisation = {
  id?: string;
  code: string;
  name: string;
  legacy: true;
  data: {
    dataBuilder: string;
    config: LegacyReport['config'];
  };
  presentation: Presentation;
};

export type DashboardViz = DashboardVisualisation | LegacyDashboardVisualisation;

export interface VisualisationValidator {
  validate: (object: DashboardVisualisation) => void;
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

export type DashboardRelation = {
  dashboardCode: string;
  entityTypes: string[];
  projectCodes: string[];
  permissionGroups: string[];
  sortOrder?: number;
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

export type DashboardRelationRecord = CamelKeysToSnake<Omit<DashboardRelation, 'dashboardCode'>> & {
  id: string;
  child_id: string;
  dashboard_id: string;
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
