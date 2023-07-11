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
  MatrixConfig,
} from '@tupaia/types';
import { ActivePolygonProps, LeafletMapProps } from '@tupaia/ui-map-components';
import { ViewContent as ChartViewContent } from '@tupaia/ui-chart-components';
import { Position } from 'geojson';
import { KeysToCamelCase } from './helpers';
import { GRANULARITY_CONFIG } from '@tupaia/utils';
import { MatrixColumnType, MatrixRowType } from '@tupaia/ui-components';

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
  Omit<KeysToCamelCase<DashboardItemConfig>, 'viewType' | 'chartType', 'entityheader'> & {
    chartType?: string;
    viewType?: string;
    entityHeader?: string;
  };

export type DashboardsResponse = {
  dashboardName: string;
  dashboardCode: string;
  dashboardId: string;
  entityCode: string;
  entityName: string;
  entityType: string;
  items: DashboardItemType[];
};

export type DashboardCode = DashboardsResponse['dashboardCode'];

export type TupaiaUrlParams = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  dashboardCode?: DashboardCode;
};

export type ReportDisplayProps = ViewContent & DashboardItemType;
export type DashboardName = DashboardResponse['dashboardName'];

export type SingleMapOverlayItem = KeysToCamelCase<
  Pick<MapOverlay, 'code', 'name', 'legacy', 'report_code'>
> & {
  measureLevel?: string;
  displayType: string;
  periodGranularity?: keyof typeof GRANULARITY_CONFIG;
  startDate?: string;
  endDate?: string;
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

// re-type the coordinates to be what the ui-map-components expect, because in the types package they are any | null
export type Entity = KeysToCamelCase<Omit<BaseEntity, 'region' | 'bounds'>> & {
  region?: ActivePolygonProps['coordinates'];
  bounds?: Position[];
};
/* Response Types */
// Todo: replace with types from @tupaia/types

export type EntityResponse = Entity & {
  parentCode: Entity['code'];
  childCodes: Entity['code'][];
  photoUrl?: string;
  children?: Entity[];
};

export type MatrixDataRow = Record<string, any> & {
  dataElement?: string;
  categoryId?: string;
  category?: string;
};

export type MatrixDataColumn = {
  title: string;
  key: string;
  category?: string;
  columns?: MatrixDataColumn[];
};
export type MatrixViewContent = MatrixConfig & {
  rows: MatrixDataRow[];
  columns: MatrixDataColumn[];
};

export type DashboardItemDisplayProps = {
  viewContent: ChartViewContent | MatrixViewContent;
  isEnlarged?: boolean;
};
