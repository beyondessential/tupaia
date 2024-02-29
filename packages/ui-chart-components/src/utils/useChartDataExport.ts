/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import { useDataTableExport } from '@tupaia/ui-components';
import { ExportViewContent } from '../types';
import { getChartTableData } from './getChartTableData';

export const useChartDataExport = (viewContent?: ExportViewContent, title = '') => {
  const startDate = viewContent && 'startDate' in viewContent ? viewContent.startDate : undefined;
  const endDate = viewContent && 'endDate' in viewContent ? viewContent.endDate : undefined;

  const { columns, data } = getChartTableData(viewContent);

  return useDataTableExport(columns, data, title, startDate, endDate);
};
