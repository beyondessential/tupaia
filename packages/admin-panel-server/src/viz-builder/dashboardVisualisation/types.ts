/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CamelKeysToSnake, LegacyReport, Report, VizData } from '../types';

type VizType = 'view' | 'chart' | 'matrix';

type Presentation = Record<string, unknown> & {
  readonly type: VizType;
  readonly output: Record<string, unknown>;
};

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

export type DashboardRecord = CamelKeysToSnake<Dashboard>;

export type DashboardItemRecord = CamelKeysToSnake<DashboardItem>;

export type DashboardRelationRecord = CamelKeysToSnake<Omit<DashboardRelation, 'dashboardCode'>> & {
  id: string;
  child_id: string;
  dashboard_id: string;
};

export type DashboardVisualisationResource = { dashboardItem: DashboardItem; report: Report };

export type LegacyDashboardVisualisationResource = {
  dashboardItem: DashboardItem;
  report: LegacyReport;
};

export type DashboardVizResource =
  | DashboardVisualisationResource
  | LegacyDashboardVisualisationResource;
