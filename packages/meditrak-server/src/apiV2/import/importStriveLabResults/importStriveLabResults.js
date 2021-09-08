/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import xlsx from 'xlsx';

import { mapKeys, respond, WorkBookParser, UploadError } from '@tupaia/utils';
import { SurveyResponseImporter } from '../../utilities';
import SURVEYS from './surveys.json';
import { assertCanImportSurveyResponses } from '../importSurveyResponses/assertCanImportSurveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';

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

const getEntitiesGroupedBySurveyName = async (models, inputsPerSurvey) => {
  const entitiesGroupedBySurveyName = {};

  for (const entry of Object.entries(inputsPerSurvey)) {
    const [surveyName, surveyResponses] = entry;
    surveyResponses.forEach(surveyResponse => {
      const { entityCode } = surveyResponse;

      if (!entitiesGroupedBySurveyName[surveyName]) {
        entitiesGroupedBySurveyName[surveyName] = [];
      }

      entitiesGroupedBySurveyName[surveyName].push(entityCode);
    });
  }

  return entitiesGroupedBySurveyName;
};

export const importStriveLabResults = async (req, res) => {
  const { file, models, userId } = req;
  if (!file) {
    throw new UploadError();
  }

  const parser = createWorkBookParser();
  const workBook = xlsx.readFile(file.path);
  const inputsPerSurvey = await parser.parse(workBook);
  const entitiesGroupedBySurveyName = await getEntitiesGroupedBySurveyName(models, inputsPerSurvey);

  const importSurveyResponsePermissionsChecker = async accessPolicy => {
    await assertCanImportSurveyResponses(accessPolicy, models, entitiesGroupedBySurveyName);
  };

  await req.assertPermissions(
    assertAnyPermissions([assertBESAdminAccess, importSurveyResponsePermissionsChecker]),
  );

  const importer = createImporter(models);
  const results = await importer.import(inputsPerSurvey, userId);

  respond(res, { count: results.length, results });
};
