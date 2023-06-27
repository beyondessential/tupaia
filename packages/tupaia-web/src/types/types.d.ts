import {
  LandingPage,
  Project,
  Country,
  Entity as BaseEntity,
  Dashboard as BaseDashboard,
  DashboardItem as BaseDashboardItem,
  DashboardItemConfig,
  MapOverlay,
  MapOverlayGroupRelation,
  EntityType,
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

export type SingleMapOverlayItem = KeysToCamelCase<
  Pick<MapOverlay, 'code', 'name', 'legacy', 'report_code'>
> & {
  measureLevel?: string;
  displayType: string;
};

export type MapOverlayGroup = {
  name: MapOverlay['name'];
  children: SingleMapOverlayItem[] | MapOverlayGroup[];
};
export type MapOverlays = {
  entityCode: EntityCode;
  entityType: EntityType;
  name: string;
  mapOverlays: MapOverlayGroup[];
};

export type Entity = KeysToCamelCase<BaseEntity>;
