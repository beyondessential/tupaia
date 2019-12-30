/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';

import { UploadError } from '../../errors';
import { mapKeys, WorkBookParser } from '../../utilities';
import { SurveyResponseImporter } from '../utilities';
import SURVEYS from './surveys';
import { respond } from '../../respond';

const ENTITY_CODE_KEY = 'entityCode';
const SURVEY_NAMES = Object.keys(SURVEYS);

const createWorkBookParser = () => {
  const constructKeyMapper = keyMapping => input => mapKeys(input, keyMapping);

  const mappers = Object.entries(SURVEYS).reduce((result, [surveyName, keyMapping]) => {
    return { ...result, [surveyName]: constructKeyMapper(keyMapping) };
  }, {});
  const parser = new WorkBookParser(mappers);
  parser.setSheetNameFilter(SURVEY_NAMES);

  return parser;
};

const createImporter = models => {
  const constructResponseExtractor = () => async input => {
    const entityCode = input[ENTITY_CODE_KEY];
    const { id: entityId } = await models.entity.findOne({ code: entityCode });

    const answers = { ...input };
    delete answers[ENTITY_CODE_KEY];

    return { entityId, answers };
  };

  const responseExtractors = SURVEY_NAMES.reduce((result, surveyName) => {
    return { ...result, [surveyName]: constructResponseExtractor() };
  }, {});

  return new SurveyResponseImporter(models, responseExtractors);
};

export const importStriveLabResults = async (req, res) => {
  const { file, models, userId } = req;
  if (!file) {
    throw new UploadError();
  }

  const parser = createWorkBookParser();
  const workBook = xlsx.readFile(file.path);
  const inputsPerSurvey = await parser.parse(workBook);

  const importer = createImporter(models);
  const results = await importer.import(inputsPerSurvey, userId);

  respond(res, { count: results.length, results });
};
