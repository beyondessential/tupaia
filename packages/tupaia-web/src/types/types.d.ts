import {
  LandingPage,
  Project,
  Country,
  Entity as BaseEntity,
  Dashboard as BaseDashboard,
  DashboardItem as BaseDashboardItem,
  DashboardItemConfig as BaseDashboardItemConfig,
  MapOverlay,
  MapOverlayGroupRelation,
  EntityType,
  MatrixConfig,
} from '@tupaia/types';
import { ActivePolygonProps, LeafletMapProps } from '@tupaia/ui-map-components';
import {
  ViewContent as ChartViewContent,
  DataProps,
  ViewContent,
} from '@tupaia/ui-chart-components';
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

// This is the row type in the response from the report endpoint when the report is a matrix. It will contain data for each column, keyed by the column key, as well as dataElement, categoryId and category
export type MatrixDataRow = Record<string, any> & {
  dataElement?: string; // this is the data to display in the row header cell
  categoryId?: string; // this means the row is a child of a grouped row
  category?: string; // this means the row is a grouped row
};

// This is the column type in the response from the report endpoint when the report is a matrix
export type MatrixDataColumn = {
  title: string;
  key: string;
  category?: string; // this means the column is a grouped column
  columns?: MatrixDataColumn[]; // these are the child columns of a grouped column
};

// The 'ViewContent' is the data that is passed to the matrix view component
export type MatrixViewContent = MatrixConfig & {
  rows: MatrixDataRow[];
  columns: MatrixDataColumn[];
};

export type ViewDataItem = Record<string, any> &
  DataProps & {
    total?: number;
    viewType?: string;
  };

export type ViewReport = {
  data?: ViewDataItem[];
  startDate?: string;
  endDate?: string;
};

export type MatrixData = {
  columns: MatrixDataColumn[];
  rows: MatrixDataRow[];
  startDate?: string;
  endDate?: string;
};

export type ChartData = {
  data: DataProps[];
  startDate?: string;
  endDate?: string;
};

export type DashboardItemReport = ViewReport | MatrixData | ChartData;
