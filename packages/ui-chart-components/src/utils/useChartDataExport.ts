/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { useDataTableExport } from '@tupaia/ui-components';
import { getChartTableData } from './getChartTableData';
import { ViewContent } from '../types';

export const useChartDataExport = (viewContent: ViewContent, title: string) => {
  const { startDate, endDate } = viewContent ?? {};
  const { columns, data } = getChartTableData(viewContent);
  return useDataTableExport(columns, data, title, startDate, endDate);
};
