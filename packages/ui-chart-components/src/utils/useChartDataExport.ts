/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { useDataTableExport } from '@tupaia/ui-components';
import { ChartConfig, ChartReport } from '@tupaia/types';
import { getChartTableData } from './getChartTableData';

export const useChartDataExport = (config?: ChartConfig, report?: ChartReport, title = '') => {
  const { columns, data } = getChartTableData(report, config);

  return useDataTableExport(columns, data, title, report?.startDate, report?.endDate);
};
