/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DashboardItemType } from './common';
import { ValueType, ViewConfig } from './dashboard-item';

type Transform = string | Record<string, unknown>;

export type StandardReportConfig = {
  transform: Transform[];
  output?: Record<string, unknown>;
};

export type CustomReportConfig = {
  customReport: string;
};

export type ReportConfig = StandardReportConfig | CustomReportConfig;

// This is the row type in the response from the report endpoint when the report is a matrix. It will contain data for each column, keyed by the column key, as well as dataElement, categoryId and category
export type MatrixReportRow = Record<string, unknown> & {
  dataElement?: string; // this is the data to display in the row header cell
  categoryId?: string; // this means the row is a child of a grouped row
  category?: string; // this means the row is a grouped row
  valueType?: ValueType;
};

// This is the column type in the response from the report endpoint when the report is a matrix
export type MatrixReportColumn = {
  title: string;
  key: string;
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
};
// This is the data item for a report of type 'view'
export type ViewDataItem =
  | (Record<string, any> & {
      value?: any;
      total?: number;
      viewType?: ViewConfig['viewType'];
    })
  | DownloadFilesVisualDataItem;

// This is the shape of a report when type is 'view'
export type ViewReport = Omit<BaseReport, 'data'> & {
  type: `${DashboardItemType.View}`;
  data?: ViewDataItem[];
  downloadUrl?: string;
};

export type MatrixReport = Omit<BaseReport, 'data'> & {
  type: `${DashboardItemType.Matrix}`;
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

export type ChartReport = Omit<BaseReport, 'data'> & {
  type: `${DashboardItemType.Chart}`;
  data?: ChartData[];
};

export type DashboardItemReport = ViewReport | MatrixReport | ChartReport;
