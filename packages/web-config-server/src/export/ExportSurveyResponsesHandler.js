import { fetchFromCentralServerUsingTokens } from '/appServer/requestHelpers';
import { RouteHandler } from '/apiV1/RouteHandler';
import { ExportSurveyResponsesPermissionsChecker } from '/apiV1/permissions';

export class ExportSurveyResponsesHandler extends RouteHandler {
  static PermissionsChecker = ExportSurveyResponsesPermissionsChecker;

  async handleRequest() {
    await super.handleRequest();
    const {
      organisationUnitCode,
      surveyCodes,
      latest,
      startDate,
      endDate,
      timeZone,
      itemCode,
      easyReadingMode,
    } = this.query;
    const centralServerEndpoint = 'export/surveyResponses';
    const {
      config: { name: reportName },
    } = itemCode && (await this.models.dashboardItem.findOne({ code: itemCode }));

    const queryParameters = {
      latest,
      surveyCodes,
      startDate,
      endDate,
      timeZone,
      reportName,
      easyReadingMode,
    };

    if (organisationUnitCode.length === 2) {
      // The code is only two characters, must be the 2 character country ISO code
      queryParameters.countryCode = organisationUnitCode;
    } else {
      queryParameters.entityCode = organisationUnitCode;
    }

    const response = await fetchFromCentralServerUsingTokens(
      this.models,
      centralServerEndpoint,
      null,
      queryParameters,
      this.req.session.userJson.userName,
    );

    pipeSurveyResponseToClient(response, this.res);
  }
}

function pipeSurveyResponseToClient(response, res) {
  res.setHeader('Content-Disposition', response.headers.get('Content-Disposition'));
  res.setHeader('Content-Type', response.headers.get('Content-Type'));
  response.body.pipe(res);
}
