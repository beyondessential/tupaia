/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { DataProps } from '@tupaia/ui-chart-components';

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
