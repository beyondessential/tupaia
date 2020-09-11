import { fetchFromMeditrakServerUsingTokens } from '/appServer/requestHelpers';
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
      easyReadingMode,
    } = this.query;
    const meditrakServerEndpoint = 'export/surveyResponses';
    const queryParameters = {
      latest,
      surveyCodes,
      startDate,
      endDate,
      easyReadingMode,
    };

    if (organisationUnitCode.length === 2) {
      // The code is only two characters, must be the 2 character country ISO code
      queryParameters.countryCode = organisationUnitCode;
    } else {
      queryParameters.entityCode = organisationUnitCode;
    }

    let response;
    try {
      response = await fetchFromMeditrakServerUsingTokens(
        this.models,
        meditrakServerEndpoint,
        null,
        queryParameters,
        this.req.session.userJson.userName,
      );
    } catch (error) {
      throw error;
    }

    pipeSurveyResponseToClient(response, this.res);
  }
}

function pipeSurveyResponseToClient(response, res) {
  res.setHeader('Content-Disposition', response.headers.get('Content-Disposition'));
  res.setHeader('Content-Type', response.headers.get('Content-Type'));
  response.body.pipe(res);
}
