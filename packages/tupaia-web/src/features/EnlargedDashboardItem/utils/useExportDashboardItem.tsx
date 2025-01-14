import { RefObject, useContext, useEffect } from 'react';
import moment from 'moment';
import downloadJs from 'downloadjs';
import domtoimage from 'dom-to-image';
import { useParams } from 'react-router-dom';
import { DashboardItemConfig, DashboardItemReport } from '@tupaia/types';
import { toFilename } from '@tupaia/utils';
import { useChartDataExport } from '@tupaia/ui-chart-components';
import { Dashboard, DashboardItem, Entity, EntityCode, ProjectCode } from '../../../types';
import { gaEvent } from '../../../utils';
import { useExportToExcel } from '../../../api/mutations';
import { ExportFormats, useExportSettings } from '../../ExportSettings';
import { ExportDashboardItemContext } from './ExportDashboardItemContext';
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
  const {
    exportFormat,
    exportWithLabels,
    exportWithTable,
    exportWithTableDisabled,
    resetExportSettings,
  } = useExportSettings();
  const { setExportError, setIsExportMode, setIsExporting } = useContext(
    ExportDashboardItemContext,
  );

  const { config } = currentDashboardItem || ({} as DashboardItem);

  const exportTitle = `${config?.name}, ${entityName}`;

  const getExportViewConfig = () => {
    if (!config || config?.type !== 'chart') return config;
    const { chartType } = config;
    if (chartType === 'gauge') return config;
    const { presentationOptions } = config;
    return {
      ...config,
      presentationOptions: {
        ...presentationOptions,
        exportWithLabels,
        exportWithTable,
        exportWithTableDisabled,
      },
    };
  };

  const exportViewConfig = getExportViewConfig();
  const { doExport } = useChartDataExport(exportViewConfig, reportData, exportTitle);

  const filename = toFilename(`export-${entityName}-${config?.name}`, true);
  const file = `${filename}.${exportFormat}`;

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
    setIsExportMode(false);
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
    [ExportFormats.XLSX]: config?.type === 'matrix' ? () => exportToExcel(excelParams) : doExport,
  };

  // reset the export state when the current dashboard item changes
  useEffect(() => {
    setExportError(null);
    setIsExporting(false);
    setIsExportMode(false);
    resetExportSettings(config?.type);
  }, [currentDashboardItem]);

  return {
    handleExport: EXPORT_FUNCTIONS[exportFormat],
    cancelExport,
  };
};
