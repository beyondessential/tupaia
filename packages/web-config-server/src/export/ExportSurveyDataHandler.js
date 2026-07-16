import fs from 'node:fs/promises';
import xlsx from 'xlsx';

import { getExportPathForUser } from '@tupaia/server-utils';
import { getExportDatesString, respondWithDownload } from '@tupaia/utils';
import { formatMatrixDataForExcel } from './excelFormatters/formatMatrixDataForExcel';
import { requestFromTupaiaConfigServer } from './requestFromTupaiaConfigServer';
import { RouteHandler } from '/apiV1/RouteHandler';
import { ExportSurveyResponsesPermissionsChecker } from '/apiV1/permissions';
import { USER_SESSION_CONFIG } from '/authSession';

const EXPORT_FILE_TITLE = 'survey_response_export';

export class ExportSurveyDataHandler extends RouteHandler {
  static PermissionsChecker = ExportSurveyResponsesPermissionsChecker;

  async handleRequest() {
    const {
      organisationUnitCode,
      itemCode,
      dashboardCode,
      projectCode,
      surveyCodes,
      startDate,
      endDate,
      timeZone,
    } = this.query;

    const { headers, cookies } = this.req;
    const sessionCookieName = USER_SESSION_CONFIG.cookieName;
    const sessionCookie = cookies[sessionCookieName];
    // If we used an auth header rather than a session, pass it along to the next request
    const authHeader = headers.authorization || headers.Authorization;
    const {
      report_code: reportCode,
      legacy,
      config,
    } = await this.models.dashboardItem.findOne({
      code: itemCode,
    });

    // Get the data for the chart
    const queryParameters = {
      itemCode,
      organisationUnitCode,
      dashboardCode,
      projectCode,
      surveyCodes,
      startDate,
      endDate,
      legacy,
      isExpanded: true,
    };

    const data = await requestFromTupaiaConfigServer(
      `report/${reportCode}`,
      queryParameters,
      sessionCookieName,
      sessionCookie,
      true,
      {
        authorization: authHeader,
      },
    );

    const sheetNames = [];
    const sheets = {};
    const { name: organisationUnitName } = await this.models.entity.findOne({
      code: organisationUnitCode,
    });
    const reportTitle = `${config.name}, ${organisationUnitName}`;

    Object.entries(data.data).forEach(([surveyName, surveyData]) => {
      const header = surveyData.data.columns.length
        ? `Data ${getExportDatesString(startDate, endDate)}`
        : `No data for ${surveyName} ${getExportDatesString(startDate, endDate)}`;

      const titleAndHeaderData = [[`${reportTitle}: ${surveyName}`], [header]];
      // Using array of arrays (aoa) input as transformations like mergeSurveys
      // increases the likelyhood of columns with same title (leads to missing keys in object json (aoo))
      const formattedData = surveyData.data.columns.length
        ? formatMatrixDataForExcel(surveyData.data, timeZone)
        : [];

      // Header and title
      let sheet = xlsx.utils.aoa_to_sheet(titleAndHeaderData);

      const { skipHeader = true } = surveyData;

      // Formatted data using array of arrays input
      sheet = xlsx.utils.sheet_add_aoa(sheet, formattedData, {
        skipHeader,
        origin: -1, // Append to bottom of worksheet starting on first column
      });

      const sheetName = surveyName.substring(0, 31); // stay within excel sheet name limit

      sheetNames.push(sheetName);
      sheets[sheetName] = sheet;
    });

    const workbook = {
      SheetNames: sheetNames,
      Sheets: sheets,
    };

    const exportDirectory = getExportPathForUser(this.req.user.id);
    await fs.mkdir(exportDirectory, { recursive: true });

    const filePath = `${exportDirectory}/${EXPORT_FILE_TITLE}_${Date.now()}.xlsx`;

    xlsx.writeFile(workbook, filePath);
    respondWithDownload(this.res, filePath);
  }
}
