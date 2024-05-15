/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { useDataTableExport } from '@tupaia/ui-components';
import { DashboardItemConfig, DashboardItemReport } from '@tupaia/types';
import { getChartTableData } from './getChartTableData';

export const useChartDataExport = (
  config?: DashboardItemConfig,
  report?: DashboardItemReport,
  title = '',
) => {
  const { columns, data = [] } = getChartTableData(report, config);

  return useDataTableExport(columns, data, title, report?.startDate, report?.endDate);
};
