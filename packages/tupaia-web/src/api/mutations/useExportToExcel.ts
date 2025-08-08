import { useMutation } from '@tanstack/react-query';
import { getBrowserTimeZone } from '@tupaia/utils';
import { DashboardItem, EntityCode, ProjectCode } from '../../types';
import { get } from '..';

type ExportToExcelBody = {
  projectCode?: ProjectCode;
  entityCode?: EntityCode;
  itemCode?: DashboardItem['code'];
  startDate?: string;
  endDate?: string;
  dataElementHeader?: string;
  legacy?: boolean;
};

// Requests the export
export const useExportToExcel = ({
  onError,
  onSuccess,
  onMutate,
}: {
  onError: (error: Error) => void;
  onSuccess: (data: Blob) => void;
  onMutate: () => void;
}) => {
  const timeZone = getBrowserTimeZone();
  return useMutation<any, Error, ExportToExcelBody, unknown>(
    (params: ExportToExcelBody) =>
      get('export/chart', {
        responseType: 'blob',
        params: {
          ...params,
          organisationUnitCode: params.entityCode,
          timeZone,
        },
      }),
    {
      onSuccess,
      onMutate,
      onError,
    },
  );
};
