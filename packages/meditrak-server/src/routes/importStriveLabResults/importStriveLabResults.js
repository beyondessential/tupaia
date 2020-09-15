/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { keyBy } from 'lodash';
import xlsx from 'xlsx';

import { mapKeys, respond, WorkBookParser, UploadError } from '@tupaia/utils';
import { SurveyResponseImporter } from '../utilities';
import SURVEYS from './surveys';
import { assertCanImportSurveyResponses } from '../importSurveyResponses/assertCanImportSurveyResponses';

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

const getEntitiesByPermissionGroup = async (models, inputsPerSurvey) => {
  const entitiesByPermissionGroup = {};
  const surveyNames = Object.keys(inputsPerSurvey);
  const surveys = await models.survey.find({ name: surveyNames });
  const permissionGroups = await models.permissionGroup.findManyById(
    surveys.map(s => s.permission_group_id),
  );
  const surveysByName = keyBy(surveys, 'name');
  const permissionGroupsById = keyBy(permissionGroups, 'id');

  for (let i = 0; i < surveyNames.length; i++) {
    const surveyName = surveyNames[i];
    const surveyResponses = inputsPerSurvey[surveyName];
    const survey = surveysByName[surveyName];

    if (!survey) {
      throw new Error(`Cannot find survey ${surveyName}`);
    }

    const permissionGroup = permissionGroupsById[survey.permission_group_id];

    surveyResponses.forEach(surveyResponse => {
      const { entityCode } = surveyResponse;

      if (!entitiesByPermissionGroup[permissionGroup.name]) {
        entitiesByPermissionGroup[permissionGroup.name] = [];
      }

      entitiesByPermissionGroup[permissionGroup.name].push(entityCode);
    });
  }

  return entitiesByPermissionGroup;
};

export const importStriveLabResults = async (req, res) => {
  const { file, models, userId } = req;
  if (!file) {
    throw new UploadError();
  }

  const parser = createWorkBookParser();
  const workBook = xlsx.readFile(file.path);
  const inputsPerSurvey = await parser.parse(workBook);
  const entitiesByPermissionGroup = await getEntitiesByPermissionGroup(models, inputsPerSurvey);

  const importSurveyResponsePermissionsChecker = async accessPolicy => {
    await assertCanImportSurveyResponses(accessPolicy, models, entitiesByPermissionGroup);
  };

  await req.assertPermissions(importSurveyResponsePermissionsChecker);

  const importer = createImporter(models);
  const results = await importer.import(inputsPerSurvey, userId);

  respond(res, { count: results.length, results });
};
