import xlsx from 'xlsx';
import moment from 'moment';
import fs from 'fs';

import { requestFromTupaiaConfigServer } from './requestFromTupaiaConfigServer';
import { formatMatrixDataForExcel } from './excelFormatters/formatMatrixDataForExcel';
import { emailExport } from './emailExport';

const EXPORT_FILE_TITLE = 'survey_response_export';
const EXPORT_DIRECTORY = 'exports';

/*
 * Export a chart to Excel.
 */
export const exportChartToExcel = async (
  chartConfig,
  sessionCookieName,
  sessionCookie,
  emailAddress,
) => {
  const { viewId, organisationUnitCode, dashboardGroupId, projectCode, extraConfig } = chartConfig;

  // Get the data for the chart
  const queryParameters = {
    viewId,
    organisationUnitCode,
    dashboardGroupId,
    projectCode,
    isExpanded: true,
    ...extraConfig,
  };
  const data = await requestFromTupaiaConfigServer(
    'view',
    queryParameters,
    sessionCookieName,
    sessionCookie,
  );

  // Use a custom formatter to turn it into json in the format expected by the xlsx library, i.e.
  // an array of objects, with each object in the array representing a row in the spreadsheet, and
  // each key value pair in that object representing a column (with the key as the column header)
  const formattedData = formatMatrixDataForExcel(data, extraConfig.export);

  // Export out to an excel file
  const sheet = xlsx.utils.json_to_sheet(formattedData);
  const sheetName = `Export on ${moment().format('Do MMM YY')}`;
  const workbook = { SheetNames: [sheetName], Sheets: { [sheetName]: sheet } };
  if (!(await fs.existsSync(EXPORT_DIRECTORY))) {
    await fs.mkdirSync(EXPORT_DIRECTORY);
  }
  const filePath = `${EXPORT_DIRECTORY}/${EXPORT_FILE_TITLE}_${Date.now()}.xlsx`;
  xlsx.writeFile(workbook, filePath);

  // Email it to the requester
  emailExport(emailAddress, filePath, `${chartConfig.exportFileName}`);
};
