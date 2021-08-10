/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useDataTableExport } from '@tupaia/ui-components';
import { getChartTableData } from './getChartTableData';

export const useChartDataExport = viewContent => {
  const { columns, data } = getChartTableData(viewContent);
  useDataTableExport(columns, data, viewContent.name);
};
