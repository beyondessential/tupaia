import {
  LandingPage,
  Project,
  Country,
  Entity,
  Dashboard as BaseDashboard,
  DashboardItem as BaseDashboardItem,
  DashboardItemConfig,
} from '@tupaia/types';
import { ViewContent } from '@tupaia/ui-chart-components';
import { KeysToCamelCase } from './helpers';

export type SingleProject = KeysToCamelCase<Project> & {
  hasAccess: boolean;
  hasPendingAccess: boolean;
  homeEntityCode: string;
  defaultDashboard: string;
  name: string;
  names: string[];
};

export type SingleLandingPage = KeysToCamelCase<Omit<LandingPage, 'project_codes'>> & {
  projects: SingleProject[];
};

export type CountryAccessListItem = Country & {
  hasAccess: boolean;
  accessRequests: string[];
};

export type ProjectCode = Project['code'];

export type EntityCode = Entity['code'];

export type DashboardItemType = Omit<KeysToCamelCase<BaseDashboardItem>, 'config'> &
  Omit<KeysToCamelCase<DashboardItemConfig>, 'viewType' | 'chartType'> & {
    chartType?: string;
    viewType?: string;
  };

export type DashboardType = KeysToCamelCase<BaseDashboard> & {
  items: DashboardItemType[];
};

export type DashboardCode = DashboardType['code'];

export type TupaiaUrlParams = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardCode;
};

export type DashboardItemDisplayProps = ViewContent & DashboardItemType;
export type DashboardName = BaseDashboard['name'];

/* Response Types */
// Todo: replace with types from @tupaia/types

export type EntityResponse = Entity & { parentCode: Entity['code']; children?: Entity[] };
