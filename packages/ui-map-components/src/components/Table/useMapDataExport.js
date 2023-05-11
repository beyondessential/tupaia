/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useDataTableExport } from '@tupaia/ui-components';
import { getMapTableData } from './getMapTableData';

export const useMapDataExport = (serieses, measureData, title, startDate, endDate) => {
  const { columns, data } = getMapTableData(serieses, measureData);
  return useDataTableExport(columns, data, title, startDate, endDate);
};
