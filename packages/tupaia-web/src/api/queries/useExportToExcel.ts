/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { DashboardItem, EntityCode, ProjectCode } from '../../types';
import { get } from '..';
import { getBrowserTimeZone } from '@tupaia/utils';

// Requests the export
export const useExportToExcel = (
  params: {
    projectCode?: ProjectCode;
    entityCode?: EntityCode;
    itemCode?: DashboardItem['code'];
    startDate?: string;
    endDate?: string;
    dataElementHeader?: string;
    legacy?: boolean;
  },
  enabled?: boolean,
) => {
  const timeZone = getBrowserTimeZone();
  const { projectCode, entityCode, itemCode, startDate, endDate } = params;
  return useQuery(
    ['export/chart', projectCode, entityCode, itemCode, startDate, endDate],
    () =>
      get('export/chart', {
        params: {
          ...params,
          organisationUnitCode: entityCode,
          timeZone,
        },
      }),
    { enabled },
  );
};
