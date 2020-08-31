import xlsx from 'xlsx';
import fs from 'fs';
import moment from 'moment';

import { requestFromTupaiaConfigServer } from './requestFromTupaiaConfigServer';
import { USER_SESSION_CONFIG } from '/authSession';
import { RouteHandler } from '/apiV1/RouteHandler';
import { ExportSurveyResponsesPermissionsChecker } from '/apiV1/permissions';
import { formatMatrixDataForExcel } from './excelFormatters/formatMatrixDataForExcel';

const EXPORT_FILE_TITLE = 'survey_response_export';
const EXPORT_DIRECTORY = 'exports';

export class ExportSurveyDataHandler extends RouteHandler {
  static PermissionsChecker = ExportSurveyResponsesPermissionsChecker;

  async handleRequest() {
    await super.handleRequest();
    const {
      organisationUnitCode,
      viewId,
      dashboardGroupId,
      projectCode,
      surveyCodes,
      startDate,
      endDate,
    } = this.query;

    const sessionCookieName = USER_SESSION_CONFIG.cookieName;
    const sessionCookie = this.req.cookies[sessionCookieName];

    // Get the data for the chart
    const queryParameters = {
      viewId,
      organisationUnitCode,
      dashboardGroupId,
      projectCode,
      surveyCodes,
      startDate,
      endDate,
      isExpanded: true,
    };
    const data = await requestFromTupaiaConfigServer(
      'view',
      queryParameters,
      sessionCookieName,
      sessionCookie,
    );

    const sheetNames = [];
    const sheets = {};

    Object.entries(data.data).forEach(([surveyName, surveyData]) => {
      const header = surveyData.data.columns.length
        ? `Data ${this.getExportDatesString(startDate, endDate)}`
        : `No data for ${surveyName} ${this.getExportDatesString(startDate, endDate)}`;

      const headerData = [[header]];
      // Using array of arrays (aoa) input as transformations like mergeSurveys
      // increases the likelyhood of columns with same title (leads to missing keys in object json (aoo))
      const formattedData = surveyData.data.columns.length
        ? formatMatrixDataForExcel(surveyData.data)
        : [];

      //Header
      let sheet = xlsx.utils.aoa_to_sheet(headerData);

      const { skipHeader = true } = surveyData;

      //Formatted data using array of arrays input
      sheet = xlsx.utils.sheet_add_aoa(sheet, formattedData, {
        skipHeader,
        origin: 'A2',
      });

      sheetNames.push(surveyName);
      sheets[surveyName] = sheet;
    });

    const workbook = {
      SheetNames: sheetNames,
      Sheets: sheets,
    };

    if (!(await fs.existsSync(EXPORT_DIRECTORY))) {
      await fs.mkdirSync(EXPORT_DIRECTORY);
    }

    const filePath = `${EXPORT_DIRECTORY}/${EXPORT_FILE_TITLE}_${Date.now()}.xlsx`;
    xlsx.writeFile(workbook, filePath);
    this.res.download(filePath);
  }

  getExportDatesString = (startDate, endDate) => {
    const format = 'D-M-YY';
    let dateString = '';

    if (startDate && endDate) {
      dateString = `between ${moment(startDate).format(format)} and ${moment(endDate).format(
        format,
      )} `;
    } else if (startDate) {
      dateString = `after ${moment(startDate).format(format)} `;
    } else if (endDate) {
      dateString = `before ${moment(endDate).format(format)} `;
    }

    return `${dateString}as of ${moment().format(format)}`;
  };
}
