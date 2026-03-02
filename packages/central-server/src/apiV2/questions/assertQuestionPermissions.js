import { QUERY_CONJUNCTIONS, RECORDS } from '@tupaia/database';
import { assertDataElementEditPermissions } from '../dataElements/assertDataElementPermissions';
import { hasBESAdminAccess } from '../../permissions';
import { mergeMultiJoin } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertQuestionEditPermissions = async (accessPolicy, models, questionId) => {
  const question = await models.question.findById(questionId);
  if (!question) {
    throw new Error(`No question exists with id ${questionId}`);
  }
  return assertDataElementEditPermissions(accessPolicy, models, question.data_element_id);
};

export const createQuestionDBFilter = async (accessPolicy, models, criteria, options) => {
  const dbConditions = { ...criteria };
  const dbOptions = { ...options };

  if (hasBESAdminAccess(accessPolicy)) {
    return { dbConditions, dbOptions };
  }

  const countryIdsByPermissionGroupId =
    await models.permissionGroup.fetchCountryIdsByPermissionGroupId(accessPolicy);

  dbOptions.multiJoin = mergeMultiJoin(
    [
      {
        joinWith: RECORDS.SURVEY_SCREEN_COMPONENT,
        joinCondition: [`${RECORDS.SURVEY_SCREEN_COMPONENT}.question_id`, `${RECORDS.QUESTION}.id`],
      },
      {
        joinWith: RECORDS.SURVEY_SCREEN,
        joinCondition: [
          `${RECORDS.SURVEY_SCREEN}.id`,
          `${RECORDS.SURVEY_SCREEN_COMPONENT}.screen_id`,
        ],
      },
      {
        joinWith: RECORDS.SURVEY,
        joinCondition: [`${RECORDS.SURVEY}.id`, `${RECORDS.SURVEY_SCREEN}.survey_id`],
      },
    ],
    dbOptions.multiJoin,
  );

  dbConditions[RAW] = {
    sql: `
    (
      survey.country_ids
      &&
      ARRAY(
        SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->survey.permission_group_id)::TEXT)
      )
    )`,
    parameters: JSON.stringify(countryIdsByPermissionGroupId),
  };

  return { dbConditions, dbOptions };
};
