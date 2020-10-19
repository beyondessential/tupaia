import xlsx from 'xlsx';
import moment from 'moment';
import fs from 'fs';

import { USER_SESSION_CONFIG } from '/authSession';
import { requestFromTupaiaConfigServer } from './requestFromTupaiaConfigServer';
import { formatMatrixDataForExcel } from './excelFormatters/formatMatrixDataForExcel';

const EXPORT_FILE_TITLE = 'survey_response_export';
const EXPORT_DIRECTORY = 'exports';

export const exportChartHandler = async (req, res) => {
  const sessionCookieName = USER_SESSION_CONFIG.cookieName;
  const sessionCookie = req.cookies[sessionCookieName];

  console.log('query params', req.query);

  const chartConfig = req.query;

  const {
    viewId,
    organisationUnitCode,
    dashboardGroupId,
    projectCode,
    startDate,
    endDate,
  } = chartConfig;

  const queryParameters = {
    viewId,
    organisationUnitCode,
    dashboardGroupId,
    projectCode,
    isExpanded: true,
    startDate,
    endDate,
  };

  const response = await requestFromTupaiaConfigServer(
    'view',
    queryParameters,
    sessionCookieName,
    sessionCookie,
  );

  // Use a custom formatter to turn it into json in the format expected by the xlsx library, i.e.
  // an array of objects, with each object in the array representing a row in the spreadsheet, and
  // each key value pair in that object representing a column (with the key as the column header)
  const formattedData = formatMatrixDataForExcel(response);

  // Export out to an excel file
  const sheet = xlsx.utils.aoa_to_sheet(formattedData);
  const sheetName = `Export on ${moment().format('Do MMM YY')}`;
  const workbook = { SheetNames: [sheetName], Sheets: { [sheetName]: sheet } };

  if (!(await fs.existsSync(EXPORT_DIRECTORY))) {
    await fs.mkdirSync(EXPORT_DIRECTORY);
  }

  const filePath = `${EXPORT_DIRECTORY}/${EXPORT_FILE_TITLE}_${Date.now()}.xlsx`;

  res.setHeader('Content-Disposition', 'attachment');
  xlsx.writeFile(workbook, filePath);
  res.download(filePath);
};
