import { useDataTableExport } from '@tupaia/ui-components';
import { getMapTableData } from './getMapTableData';
import { Series, MeasureData } from '../../types';

export const useMapDataExport = (
  serieses: Series[],
  measureData: MeasureData[],
  title: string,
  startDate: Series['startDate'],
  endDate: Series['endDate'],
) => {
  const { columns, data } = getMapTableData(serieses, measureData);
  return useDataTableExport(columns, data, title, startDate, endDate);
};
