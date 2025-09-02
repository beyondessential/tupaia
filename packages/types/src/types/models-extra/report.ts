import { ValueType, ViewConfig, MatrixEntityCell } from './dashboard-item';

export type AliasTransform = string;
export type Transform = AliasTransform | Record<string, unknown>;

type OutputConfig = Record<string, unknown> & {
  type?: string;
};

export type StandardReportConfig = {
  transform: Transform[];
  output?: OutputConfig;
};

export type CustomReportConfig = {
  customReport: string;
};

export type ReportConfig = StandardReportConfig | CustomReportConfig;

// This is the row type in the response from the report endpoint when the report is a matrix. It will contain data for each column, keyed by the column key, as well as dataElement, categoryId and category
export type MatrixReportRow = Record<string, unknown> & {
  dataElement?: string | MatrixEntityCell; // this is the data to display in the row header cell
  categoryId?: string; // this means the row is a child of a grouped row
  category?: string; // this means the row is a grouped row
  valueType?: ValueType;
};

// This is the column type in the response from the report endpoint when the report is a matrix
export type MatrixReportColumn = {
  title: string;
  key: string;
  entityCode: string;
  category?: string; // this means the column is a grouped column
  columns?: MatrixReportColumn[]; // these are the child columns of a grouped column
};

export type BaseReport = {
  type?: string;
  data?: Record<string, unknown>[];
  startDate: string;
  endDate: string;
  period?: {
    earliestAvailable?: string;
    latestAvailable?: string;
    requested?: string;
  };
};

export type DownloadFilesVisualDataItem = {
  uniqueFileName: string;
  label: string;
  viewType: never;
  value: never;
  total: never;
  name: never;
  value_metadata: never;
};
// This is the data item for a report of type 'view'
export type ViewDataItem =
  | (Record<string, any> & {
      value?: any;
      total?: number;
      viewType?: ViewConfig['viewType'];
      label?: string;
    })
  | DownloadFilesVisualDataItem;

// This is the shape of a report when type is 'view'
export type ViewReport = Omit<BaseReport, 'data' | 'type'> & {
  type?: 'default' | 'rawDataExport'; // optional because of legacy reports
  data?: ViewDataItem[];
  downloadUrl?: string;
};

export type MatrixReport = Omit<BaseReport, 'data'> & {
  type?: 'matrix'; // optional because of legacy reports
  columns?: MatrixReportColumn[];
  rows?: MatrixReportRow[];
};

/**
 * @description This is the shape of a report when type is 'chart'
 */
export interface ChartData extends Record<string, unknown> {
  name?: string;
  value: string | number;
  timestamp?: number;
}

export type ChartReport = Omit<BaseReport, 'data' | 'type'> & {
  type?: 'default'; // optional because of legacy reports
  data?: ChartData[];
};

export type DashboardItemReport = ViewReport | MatrixReport | ChartReport;

export const isChartReport = (report?: DashboardItemReport | null): report is ChartReport => {
  // If the report is a chart report, it will have a 'data' property or type 'default'
  return report?.type === 'default' || !!(report && 'data' in report);
};

export const isMatrixReport = (report?: DashboardItemReport | null): report is MatrixReport => {
  // If the report is a matrix report, it will have 'columns' and 'rows' properties or type 'matrix'
  return report?.type === 'matrix' || !!(report && 'columns' in report && 'rows' in report);
};

export const isViewReport = (report?: DashboardItemReport | null): report is ViewReport => {
  // If the report is a view report, it will have a 'data' property or type 'default' or 'rawDataExport'
  return (
    report?.type === 'default' || report?.type === 'rawDataExport' || !!(report && 'data' in report)
  );
};
