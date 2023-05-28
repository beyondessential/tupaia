/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useDataTableExport } from '@tupaia/ui-components';
import { getMapTableData } from './getMapTableData';
import { Series, TableMeasureData } from '../../types';

export const useMapDataExport = (
  serieses: Series[],
  measureData: TableMeasureData[],
  title: string,
  startDate: string | Date,
  endDate: string | Date,
) => {
  const { columns, data } = getMapTableData(serieses, measureData);
  return useDataTableExport(columns, data, title, startDate, endDate);
};
