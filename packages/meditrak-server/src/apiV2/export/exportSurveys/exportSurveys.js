/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { SurveyExporter } from './SurveyExporter';

/**
 * Responds to GET requests to the /export/survey/:id endpoint, exporting an excel document
 * containing the questions for a given survey
 * @param {object}  req - request info (e.g. url, query parameters, body)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function exportSurveys(req, res) {
  const { models, assertPermissions } = req;
  const { surveyId } = req.params;
  const { surveyCode } = req.query;
  const exporter = new SurveyExporter(models, assertPermissions);
  const filePath = await exporter.exportToFile(surveyId, surveyCode);
  res.download(filePath);
}
