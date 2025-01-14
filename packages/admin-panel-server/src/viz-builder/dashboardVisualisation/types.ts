import { Report as BaseReportType } from '@tupaia/types';
import { CamelKeysToSnake, LegacyReport, Report, VizData } from '../types';

// TODO: use DashboardItem['config']
type Presentation = Record<string, unknown> & {
  readonly output: Record<string, unknown>;
};

type DashboardVisualisation = {
  id?: string;
  code: string;
  legacy: false;
  data: VizData;
  presentation: Presentation;
  permissionGroup: string;
  latestDataParameters?: BaseReportType['latest_data_parameters'];
};

type LegacyDashboardVisualisation = {
  id?: string;
  code: string;
  legacy: true;
  data: {
    dataBuilder: string;
    config: LegacyReport['config'];
  };
  presentation: Presentation;
  latestDataParameters: never;
};

export type DashboardViz = DashboardVisualisation | LegacyDashboardVisualisation;

export type Dashboard = {
  id: string;
  code: string;
  name: string;
  rootEntityCode: string;
  sortOrder?: number | null;
};
export type NewDashboard = Omit<Dashboard, 'id'>;
export type UpsertDashboard = NewDashboard | Dashboard;

export type DashboardItem = {
  id: string;
  code: string;
  config: { name?: string } & Record<string, unknown>;
  reportCode: string;
  legacy: boolean;
};

export type DashboardRelation = {
  id: string;
  dashboardCode: string;
  entityTypes: string[];
  projectCodes: string[];
  permissionGroups: string[];
  sortOrder?: number | null;
};
export type NewDashboardRelation = Omit<DashboardRelation, 'id'>;
export type UpsertDashboardRelation = DashboardRelation | NewDashboardRelation;

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
