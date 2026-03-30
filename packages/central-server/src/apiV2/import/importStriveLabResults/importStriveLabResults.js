import xlsx from 'xlsx';

import { mapKeys, respond, UploadError, WorkBookParser } from '@tupaia/utils';
import { assertAnyPermissions, assertBESAdminAccess } from '../../../permissions';
import { SurveyResponseImporter } from '../../utilities';
import SURVEYS from './surveys.json';

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
    const getEntityId = async () => {
      try {
        const { id } = await models.entity.findOne({ code: entityCode });
        return id;
      } catch {
        throw new UploadError({ message: `No entity found with code '${entityCode}'` });
      }
    };
    const entityId = await getEntityId(entityCode);

    const answers = { ...input };
    delete answers[ENTITY_CODE_KEY];

    return { entityId, answers };
  };

  const responseExtractors = SURVEY_NAMES.reduce((result, surveyName) => {
    return { ...result, [surveyName]: constructResponseExtractor() };
  }, {});

  return new SurveyResponseImporter(models, responseExtractors);
};

const getEntitiesGroupedBySurveyCode = async (models, inputsPerSurvey) => {
  const entitiesGroupedBySurveyCode = {};

  const surveys = await models.survey.find({ name: Object.keys(inputsPerSurvey) });

  for (const entry of Object.entries(inputsPerSurvey)) {
    const [surveyName, surveyResponses] = entry;

    const survey = surveys.find(s => s.name === surveyName);
    if (!survey) {
      throw new UploadError({ message: `No survey found with name '${surveyName}'` });
    }
    const surveyCode = survey.code;

    surveyResponses.forEach(surveyResponse => {
      const { entityCode } = surveyResponse;

      if (!entitiesGroupedBySurveyCode[surveyCode]) {
        entitiesGroupedBySurveyCode[surveyCode] = [];
      }

      entitiesGroupedBySurveyCode[surveyCode].push(entityCode);
    });
  }

  return entitiesGroupedBySurveyCode;
};

export const importStriveLabResults = async (req, res) => {
  const { file, models, userId } = req;
  if (!file) {
    throw new UploadError();
  }

  const parser = createWorkBookParser();
  const workBook = xlsx.readFile(file.path);
  const inputsPerSurvey = await parser.parse(workBook);
  const entitiesGroupedBySurveyCode = await getEntitiesGroupedBySurveyCode(models, inputsPerSurvey);

  const importSurveyResponsePermissionsChecker = async accessPolicy => {
    await models.surveyResponse.assertCanImport(models, accessPolicy, entitiesGroupedBySurveyCode);
  };

  await req.assertPermissions(
    assertAnyPermissions([assertBESAdminAccess, importSurveyResponsePermissionsChecker]),
  );

  const importer = createImporter(models);
  const results = await importer.import(inputsPerSurvey, userId);

  respond(res, { count: results.length, results });
};
