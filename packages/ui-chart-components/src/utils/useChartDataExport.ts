/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useDataTableExport } from '@tupaia/ui-components';
import { getChartTableData } from './getChartTableData';

export const useChartDataExport = (viewContent, title) => {
  const { startDate, endDate } = viewContent ?? {};
  const { columns, data } = getChartTableData(viewContent);
  return useDataTableExport(columns, data, title, startDate, endDate);
};
