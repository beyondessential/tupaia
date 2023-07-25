import {
  LandingPage,
  Project,
  Country,
  Entity as BaseEntity,
  DashboardItem as BaseDashboardItem,
  MapOverlay,
} from '@tupaia/types';
import { ActivePolygonProps } from '@tupaia/ui-map-components';
import { ViewContent as ChartViewContent, DataProps } from '@tupaia/ui-chart-components';
import { Position } from 'geojson';
import { KeysToCamelCase } from './helpers';
import { GRANULARITY_CONFIG } from '@tupaia/utils';

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

export type DashboardItem = Omit<KeysToCamelCase<BaseDashboardItem>, 'config'> &
  Omit<KeysToCamelCase<DashboardItemConfig>, 'viewType' | 'chartType'> & {
    chartType?: string;
    viewType?: string;
  };

export type DashboardName = DashboardItem['dashboardName'];

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
export type MatrixReportRow = Record<string, any> & {
  dataElement?: string; // this is the data to display in the row header cell
  categoryId?: string; // this means the row is a child of a grouped row
  category?: string; // this means the row is a grouped row
};

// This is the column type in the response from the report endpoint when the report is a matrix
export type MatrixReportColumn = {
  title: string;
  key: string;
  category?: string; // this means the column is a grouped column
  columns?: MatrixReportColumn[]; // these are the child columns of a grouped column
};

// This is the data item for a report of type 'view'
export type ViewDataItem = Record<string, any> &
  DataProps & {
    total?: number;
    viewType?: string;
  };

// This is the shape of a report when type is 'view'
export type ViewReport = {
  data?: ViewDataItem[];
  startDate?: string;
  endDate?: string;
};

// This is the shape of a report when type is 'matrix'
export type MatrixReport = {
  columns?: MatrixReportColumn[];
  rows?: MatrixReportRow[];
  startDate?: string;
  endDate?: string;
};

// This is the shape of a report when type is 'chart'
export type ChartReport = {
  data?: ChartViewContent['data'];
  startDate?: string;
  endDate?: string;
};

// Union of all report types
export type DashboardItemReport = ViewReport | MatrixReport | ChartReport;
