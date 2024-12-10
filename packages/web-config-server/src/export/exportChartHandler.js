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
  // If we used an auth header rather than a session, pass it along to the next request
  const authHeader = req.headers.authorization || req.headers.Authorization;

  const chartConfig = req.query;

  const {
    itemCode,
    organisationUnitCode,
    dashboardCode,
    projectCode,
    startDate,
    endDate,
    timeZone,
    dataElementHeader,
  } = chartConfig;

  const dashboardItem = await req.models.dashboardItem.findOne({
    code: itemCode,
  });

  if (!dashboardItem) {
    throw new Error(`Cannot find dashboard item with code '${itemCode}'`);
  }

  const { report_code: reportCode, legacy, config } = dashboardItem;

  const queryParameters = {
    itemCode,
    organisationUnitCode,
    dashboardCode,
    projectCode,
    isExpanded: true,
    startDate,
    endDate,
    legacy,
  };

  const response = await requestFromTupaiaConfigServer(
    `report/${reportCode}`,
    queryParameters,
    sessionCookieName,
    sessionCookie,
    true,
    {
      authorization: authHeader,
    },
  );

  const matrixData = {
    ...response,
    name: config.name,
    organisationUnitCode,
  };

  // Use a custom formatter to turn it into json in the format expected by the xlsx library, i.e.
  // an array of objects, with each object in the array representing a row in the spreadsheet, and
  // each key value pair in that object representing a column (with the key as the column header)
  const extraConfig = dataElementHeader ? { dataElementHeader } : null;
  const formattedData = formatMatrixDataForExcel(matrixData, timeZone, extraConfig);

  // Export out to an excel file
  const sheet = xlsx.utils.aoa_to_sheet(formattedData);
  const sheetName = `Export on ${moment().format('Do MMM YY')}`;
  const workbook = { SheetNames: [sheetName], Sheets: { [sheetName]: sheet } };

  if (!(await fs.existsSync(EXPORT_DIRECTORY))) {
    await fs.mkdirSync(EXPORT_DIRECTORY);
  }

  const filePath = `${EXPORT_DIRECTORY}/${EXPORT_FILE_TITLE}_${Date.now()}.xlsx`;

  xlsx.writeFile(workbook, filePath);
  res.download(filePath, () => {
    fs.unlinkSync(filePath); // delete export file after downloaded
  });
};
