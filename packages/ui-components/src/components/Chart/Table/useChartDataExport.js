/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getChartTableData } from './getChartTableData';
import { useDataTableExport } from '../../DataPreviewTable/useDataTableExport';

export const useChartDataExport = (viewContent, title) => {
  const { columns, data } = getChartTableData(viewContent);
  return useDataTableExport(columns, data, title);
};
