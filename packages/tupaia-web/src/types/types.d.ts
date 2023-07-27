import {
  LandingPage,
  Project,
  Country,
  DashboardItem as BaseDashboardItem,
  MapOverlay,
  ViewConfig,
  TupaiaWebDashboardsRequest,
  MultiValueViewConfig,
  MultiValueRowViewConfig,
  ChartConfig,
  MatrixConfig,
  ComponentConfig,
  TupaiaWebEntityRequest,
} from '@tupaia/types';
import { ViewContent as ChartViewContent, DataProps } from '@tupaia/ui-chart-components';
import { PolygonProps } from 'react-leaflet';
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

/** Breaking up the config for dashboard items to fix error 'Expression produces a union type that is too complex to represent' which is due to the dashboard item config being so complex */
type CamelCaseDashboardItemConfig = KeysToCamelCase<BaseDashboardItemConfig>;

type DashboardItemConfigPresentationOptions =
  | MultiValueViewConfig['presentationOptions']
  | MultiValueRowViewConfig['presentationOptions']
  | MatrixConfig['presentationOptions']
  | ChartConfig['presentationOptions'];

type BaseConfig = Omit<
  BaseDashboardItemConfig,
  'viewType' | 'presentationOptions' | 'componentName'
>;
export type DashboardItemConfig = BaseConfig & {
  viewType?: ViewConfig['viewType'];
  presentationOptions?: DashboardItemConfigPresentationOptions;
  componentName?: ComponentConfig['componentName'];
};

export type DashboardItem = Omit<KeysToCamelCase<BaseDashboardItem>, 'config'> & {
  config: DashboardItemConfig;
};

export type Dashboard = TupaiaWebDashboardsRequest.ResBody[0];

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

export type Entity = Omit<TupaiaWebEntityRequest.ResBody, 'region'> & {
  parentCode: Entity['code'];
  region: PolygonProps['positions'];
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
  Omit<DataProps, 'value'> & {
    value?: DataProps['value'] | boolean;
    total?: number;
    viewType?: ViewConfig['viewType'];
  };

// This is the shape of a report when type is 'view'
export type ViewReport = {
  data?: ViewDataItem[];
  startDate?: string;
  endDate?: string;
  downloadUrl?: string;
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
