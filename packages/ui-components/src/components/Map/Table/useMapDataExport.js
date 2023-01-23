/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getMapTableData } from './getMapTableData';
import { useDataTableExport } from '../../DataTable/useDataTableExport';

export const useMapDataExport = (serieses, measureData, title) => {
  const { columns, data } = getMapTableData(serieses, measureData);
  return useDataTableExport(columns, data, title);
};
