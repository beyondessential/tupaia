/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { RefObject, useContext, useEffect } from 'react';
import moment from 'moment';
import downloadJs from 'downloadjs';
import domtoimage from 'dom-to-image';
import { useParams } from 'react-router-dom';
import { toFilename } from '@tupaia/utils';
import { ViewContent, useChartDataExport } from '@tupaia/ui-chart-components';
import {
  Dashboard,
  DashboardItem,
  DashboardItemConfig,
  DashboardItemReport,
  Entity,
  EntityCode,
  ProjectCode,
} from '../../../types';
import { gaEvent } from '../../../utils';
import { useExportToExcel } from '../../../api/mutations';
import {
  ExportSettingsActionTypes,
  ExportFormats,
  ExportSettingsContext,
  ExportSettingsDispatchContext,
} from '../../ExportSettings';
import {
  ExportDashboardItemActionTypes,
  ExportDashboardItemContext,
  ExportDashboardItemDispatchContext,
} from './ExportDashboardItemContext';
import { useEnlargedDashboardItem } from '.';

interface ExportToExcelParams {
  projectCode?: ProjectCode;
  dashboardCode?: Dashboard['code'];
  entityCode?: EntityCode;
  config?: DashboardItemConfig;
  report?: DashboardItemReport;
  filename?: string;
  currentDashboardItem?: DashboardItem;
}
// generate the params for the useExportToExcel hook
export const getExportToExcelParams = ({
  projectCode,
  dashboardCode,
  entityCode,
  config,
  report,
  currentDashboardItem,
}: ExportToExcelParams) => {
  const { exportConfig } = config || {};
  const dataElementHeader = exportConfig?.dataElementHeader;
  const { legacy, code: itemCode } = currentDashboardItem || ({} as DashboardItem);
  const { startDate, endDate } = report || ({} as DashboardItemReport);

  let newStartDate = moment.isMoment(startDate) ? startDate.utc().toISOString() : startDate;
  let newEndDate = moment.isMoment(endDate) ? endDate.utc().toISOString() : endDate;
  if (!startDate && !endDate) {
    const { startDate: viewStartDate, endDate: viewEndDate } = report || {};
    newStartDate = viewStartDate!;
    newEndDate = viewEndDate!;
  }

  return {
    projectCode,
    dashboardCode,
    entityCode,
    itemCode,
    dataElementHeader,
    startDate: newStartDate,
    endDate: newEndDate,
    legacy,
  };
};

// This is a utility hook that is used in the ExportDashboardItem component, that handles all the exporting of single dashboard items
export const useExportDashboardItem = (
  entityName?: Entity['name'],
  exportRef?: RefObject<HTMLElement>,
) => {
  const { currentDashboardItem, activeDashboard, reportData } = useEnlargedDashboardItem();
  const { projectCode, entityCode } = useParams();
  const { exportFormat, exportWithLabels, exportWithTable, exportWithTableDisabled } =
    useContext(ExportSettingsContext);
  const { exportError, isExportMode, isExporting } = useContext(ExportDashboardItemContext);
  const dispatchExportDashboardItemAction = useContext(ExportDashboardItemDispatchContext)!;
  const dispatchExportSettingsContext = useContext(ExportSettingsDispatchContext)!;
  const { config } = currentDashboardItem || ({} as DashboardItem);
  const { type, presentationOptions, name } = config || ({} as DashboardItemConfig);
  const exportTitle = `${name}, ${entityName}`;

  const { doExport } = useChartDataExport(
    {
      ...reportData,
      ...config,
      presentationOptions: {
        ...(presentationOptions || {}),
        exportWithLabels,
        exportWithTable,
        exportWithTableDisabled,
      },
    } as ViewContent,
    exportTitle,
  );

  const filename = toFilename(`export-${entityName}-${name}`, true);
  const file = `${filename}.${exportFormat}`;

  const setExportError = (message: string | null) => {
    dispatchExportDashboardItemAction({
      type: ExportDashboardItemActionTypes.SET_EXPORT_ERROR,
      payload: message,
    });
  };

  const setIsExporting = (value: boolean) => {
    dispatchExportDashboardItemAction({
      type: ExportDashboardItemActionTypes.SET_IS_EXPORTING,
      payload: value,
    });
  };

  // set the isExporting state to true and the export error state to null when the export starts
  const handleStartExport = () => {
    setIsExporting(true);
    setExportError(null);
    gaEvent('Export', file, 'Attempt');
  };

  // set the isExporting state to false and the export error state to null, and download the file when the export is successful
  const handleExportSuccess = (result: Blob | string) => {
    downloadJs(result, file);
    setIsExporting(false);
    setExportError(null);
    gaEvent('Export', file, 'Success');
  };

  // set the isExporting state to false and the export error state to the error message when the export fails
  const handleError = (e: Error) => {
    setExportError(e.message);
    setIsExporting(false);
  };

  const cancelExport = () => {
    dispatchExportDashboardItemAction({
      type: ExportDashboardItemActionTypes.SET_IS_EXPORT_MODE,
      payload: false,
    });
  };

  // use the useExportToExcel hook to export the matrix dashboard item
  const { mutate: exportToExcel } = useExportToExcel({
    onError: (e: Error) => handleError(e),
    onSuccess: handleExportSuccess,
    onMutate: handleStartExport,
  });

  // export to png if the export format is png. This should handle the setting of the isExporting state and the export error state because it is not using a hook from elsewhere
  const exportToPNG = async () => {
    try {
      handleStartExport();
      const node = exportRef?.current as Node;
      const result = await domtoimage.toPng(node, { bgcolor: 'white' });
      handleExportSuccess(result);
    } catch (e: any) {
      handleError(e);
    }
  };

  const excelParams = getExportToExcelParams({
    projectCode,
    dashboardCode: activeDashboard?.code,
    entityCode,
    config,
    report: reportData,
    currentDashboardItem,
  });

  const EXPORT_FUNCTIONS = {
    [ExportFormats.PNG]: exportToPNG,
    [ExportFormats.XLSX]: type === 'matrix' ? () => exportToExcel(excelParams) : doExport,
  };

  // reset the export state when the current dashboard item changes
  useEffect(() => {
    dispatchExportDashboardItemAction({
      type: ExportDashboardItemActionTypes.RESET_EXPORT_STATE,
    });
    dispatchExportSettingsContext({
      type: ExportSettingsActionTypes.RESET_EXPORT_STATE,
      payload: type,
    });
  }, [currentDashboardItem]);

  return {
    exportError,
    isExportMode,
    isExporting,
    setExportError,
    setIsExporting,
    handleExport: EXPORT_FUNCTIONS[exportFormat],
    cancelExport,
  };
};
