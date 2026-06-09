'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// get the screen components for entity questions
const fetchCreateNewEntityQuestionComponents = async db => {
  // get the screen components for the entity and primary entity questions that have createNew set to true and have fields set
  const createNewEntityQuestions = await db.runSql(
    `SELECT survey_screen_component.*, survey.code as survey_code from survey_screen_component 
    join survey_screen on survey_screen_component.screen_id=survey_screen.id
    join survey on survey.id=survey_screen.survey_id
    where survey_screen_component.question_id IN (SELECT id from question where type IN ('PrimaryEntity', 'Entity'))
    and survey_screen_component.config::json->>'entity' IS NOT NULL
    and survey_screen_component.config::json->'entity'->>'createNew' = 'true' 
    and survey_screen_component.config::json->'entity'->>'fields' IS NOT NULL;`,
  );
  return createNewEntityQuestions.rows.map(component => {
    return {
      ...component,
      config: JSON.parse(component.config),
    };
  });
};

const fetchRelatedScreenComponentsForSurvey = async (db, surveyCode, questionIds) => {
  // get the screen components for the related entity create questions
  const screenComponents = await db.runSql(
    `SELECT survey_screen_component.*, survey.code as survey_code from survey_screen_component 
    join survey_screen on survey_screen_component.screen_id=survey_screen.id
    join survey on survey.id=survey_screen.survey_id
    where survey.code = '${surveyCode}' AND question_id IN (${questionIds
      .map(questionId => `'${questionId}'`)
      .join(',')});`,
  );
  return screenComponents.rows.reduce((result, component) => {
    const { validation_criteria: validationCriteria } = component;
    const parsedValidationCriteria = validationCriteria ? JSON.parse(validationCriteria) : {};
    // if the question is already mandatory, skip it
    if (parsedValidationCriteria.mandatory) return result;
    // otherwise, make it mandatory and stringify the validation criteria so it is ready to update
    return [
      ...result,
      {
        ...component,
        validationCriteria: JSON.stringify({
          ...parsedValidationCriteria,
          mandatory: true,
        }),
      },
    ];
  }, []);
};

// get the screen components for related entity create questions
const fetchScreenComponentsToUpdate = async db => {
  const entityQuestionComponents = await fetchCreateNewEntityQuestionComponents(db);
  // get the question ids for questions that are part of the newly created entity, and the survey code for the survey that contains the question, because questions can be part of multiple surveys and they may not all need to be updated to be mandatory
  const questionIdsToUpdate = entityQuestionComponents.reduce((result, component) => {
    const { config, survey_code: surveyCode } = component;
    const { entity } = config;
    const { parentId, ...rest } = entity.fields;
    return [
      ...result,
      ...Object.keys(rest).map(field => {
        return {
          surveyCode,
          questionId: rest[field].questionId,
        };
      }),
    ];
  }, []);

  // get the screen components for the related entity create questions
  const screenComponentsToUpdate = await Promise.all(
    questionIdsToUpdate.map(({ surveyCode, questionId }) => {
      return fetchRelatedScreenComponentsForSurvey(db, surveyCode, [questionId]);
    }),
  );

  return screenComponentsToUpdate.flat();
};

exports.up = async function (db) {
  const screenComponentsToUpdate = await fetchScreenComponentsToUpdate(db);
  return Promise.all(
    screenComponentsToUpdate.map(component => {
      return db.runSql(
        `UPDATE survey_screen_component SET validation_criteria = '${component.validationCriteria}' WHERE id = '${component.id}';`,
      );
    }),
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
