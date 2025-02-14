import { respondWithDownload } from '@tupaia/utils';
import { allowNoPermissions } from '../../../permissions';
import { SurveyResponseVariablesExtractor } from '../../utilities';
import { exportResponsesToFile } from './exportResponsesToFile';

/**
 * Responds to GET requests to the /export/surveyResponses endpoint, exporting an excel document
 * containing the relevant survey responses
 * @param {object}  req - request info (e.g. url, query parameters, body)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function exportSurveyResponses(req, res) {
  const { models, accessPolicy, userId } = req;
  const { surveyResponseId } = req.params;
  const {
    surveyCodes,
    entityIds,
    entityCode,
    countryCode,
    includeArchived = false,
    latest = false,
    startDate,
    endDate,
    timeZone = 'UTC',
    reportName,
    easyReadingMode = false,
  } = req.query;
  let { surveyId, countryId } = req.query;

  // Each survey is checked for access before exporting, flag permissions as handled
  req.assertPermissions(allowNoPermissions);

  const variablesExtractor = new SurveyResponseVariablesExtractor(models);
  const variables = await variablesExtractor.getParametersFromInput(
    countryCode,
    entityCode,
    countryId,
    entityIds,
    surveyResponseId,
  );
  const { country, entities, surveyResponse } = variables;
  countryId = variables.countryId || country.id || countryId;
  surveyId = variables.surveyId || surveyId;

  const surveys = await variablesExtractor.getSurveys(surveyId, surveyCodes, countryId);
  const filePath = await exportResponsesToFile(models, userId, accessPolicy, {
    country,
    easyReadingMode,
    endDate,
    entities,
    latest,
    reportName,
    startDate,
    surveyResponse,
    surveys,
    timeZone,
    includeArchived,
  });
  respondWithDownload(res, filePath);
}
