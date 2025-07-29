import { cloneDeep } from 'es-toolkit/compat';
import { AnalyticsRefresher } from '@tupaia/database';
import {
  respond,
  ValidationError,
  ObjectValidator,
  hasContent,
  isPresent,
  constructRecordExistsWithId,
  constructIsEmptyOr,
  constructEveryItem,
  takesIdForm,
  takesDateForm,
  isNumber,
  constructIsValidEntityType,
} from '@tupaia/utils';
import { updateOrCreateSurveyResponse, addSurveyImage, addSurveyFile } from './utilities';
import { assertCanSubmitSurveyResponses } from '../import/importSurveyResponses/assertCanImportSurveyResponses';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  translateObjectFields,
  translateEntityCodeToId,
  translateSurveyCodeToId,
  translateUserEmailToIdAndAssessorName,
  translateQuestionCodeToId,
} from '../utilities';
import winston from '../../log';

const ACTIONS = {
  SubmitSurveyResponse: 'SubmitSurveyResponse',
  AddSurveyImage: 'AddSurveyImage',
  AddSurveyFile: 'AddSurveyFile',
};

// TODO: Tidy this up as part of RN-502

/**
 * Responds to POST requests to the /changes endpoint, integrating the data posted in the request
 * body according to the action types causing the changes
 * @param {object}  event    - event data (e.g. url, query parameters, body)
 * @param {object}  context  - runtime info (Lambda metadata)
 * @param {func}    res - function to call with response, takes (Error error, Object result)
 */
export async function postChanges(req, res) {
  const changes = req.body;
  const translatedChanges = [];

  await req.models.wrapInTransaction(async transactingModels => {
    for (const { action, payload, ...rest } of changes) {
      if (!ACTION_HANDLERS[action]) {
        throw new ValidationError(`${action} is not a supported change action`);
      }
      const translatedPayload = await PAYLOAD_TRANSLATORS[action](transactingModels, payload);
      await PAYLOAD_VALIDATORS[action](transactingModels, translatedPayload);
      translatedChanges.push({ action, translatedPayload, ...rest });
    }

    // Check permissions for survey responses
    const surveyResponsePayloads = translatedChanges
      .filter(c => c.action === ACTIONS.SubmitSurveyResponse)
      .map(c => c.translatedPayload.survey_response || c.translatedPayload);
    const surveyResponsePermissionsChecker = async accessPolicy => {
      await assertCanSubmitSurveyResponses(accessPolicy, transactingModels, surveyResponsePayloads);
    };
    await req.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, surveyResponsePermissionsChecker]),
    );

    for (const { action, translatedPayload, ...rest } of translatedChanges) {
      await ACTION_HANDLERS[action](transactingModels, translatedPayload);

      if (action === ACTIONS.SubmitSurveyResponse) {
        // TODO: Rework this functionality, as directly calling an analytics refresh here is both inefficient
        // and may create duplicate records in the analytics table
        const { waitForAnalyticsRebuild } = rest;
        if (waitForAnalyticsRebuild) {
          const { database } = transactingModels;
          await AnalyticsRefresher.refreshAnalytics(database);
        }
      }
    }
  });

  respond(res, { message: 'Successfully integrated changes into server database' });
}

/**
 * Contains functions that accept the database and payload, and handle the relevant change action
 */
const ACTION_HANDLERS = {
  // LEGACY: v1 and v2 allow survey_response object, v3 should deprecate this
  [ACTIONS.SubmitSurveyResponse]: async (models, payload) =>
    updateOrCreateSurveyResponse(models, payload.survey_response || payload),

  /**
   * AddSurveyImage works in conjunction with SubmitSurveyResponse:
   * - SurveyResponse: The answer for the photo question has an id.
   * - AddSurveyImage: The payload is { id, data } where id matches the one in the answer.
   *
   * The file is uploaded to an S3 bucket to a deterministic url based on this id.
   * The SurveyResponse action handler swaps out any photo answers for their deterministic url, assuming it has been uploaded to that url.
   */
  [ACTIONS.AddSurveyImage]: addSurveyImage,

  /**
   * AddSurveyFile works very much like AddSurveyImage, but links with SubmitSurveyResponse by `uniqueFileName` instead of `id`
   */
  [ACTIONS.AddSurveyFile]: addSurveyFile,
};

/**
 * Contains functions that accept the payload, and validate that it contains the requisite content
 * for the relevant change action, returning true if successful and throwing an error if not
 */
const PAYLOAD_VALIDATORS = {
  [ACTIONS.SubmitSurveyResponse]: async (models, payload) =>
    validateSurveyResponseObject(models, payload.survey_response || payload), // LEGACY: v1 and v2 allow survey_response object, v3 should deprecate this
  [ACTIONS.AddSurveyImage]: async (models, payload) => {
    const validator = new ObjectValidator({
      id: [hasContent],
      data: [hasContent],
    });
    await validator.validate(payload);
  },
  [ACTIONS.AddSurveyFile]: async (models, payload) => {
    const validator = new ObjectValidator({
      id: [hasContent],
      uniqueFileName: [hasContent],
      data: [hasContent],
    });
    await validator.validate(payload);
  },
};

/**
 * Contains functions that accept the payload, and translate the data so that the required fields are present
 * for the relevant change action, returning true if successful and throwing an error if not
 */
const PAYLOAD_TRANSLATORS = {
  [ACTIONS.SubmitSurveyResponse]: async (models, payload) =>
    translateSurveyResponseObject(models, payload.survey_response || payload), // LEGACY: v1 and v2 allow survey_response object, v3 should deprecate this
  [ACTIONS.AddSurveyImage]: (models, payload) => payload, // No translation required
  [ACTIONS.AddSurveyFile]: (models, payload) => payload, // No translation required
};

async function validateSurveyResponseObject(models, surveyResponseObject) {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }
  const surveyResponseObjectValidator = new ObjectValidator(
    constructSurveyResponseValidators(models),
  );
  await surveyResponseObjectValidator.validate(surveyResponseObject);
  const answerObjectValidator = new ObjectValidator(constructAnswerValidators(models));
  for (let i = 0; i < surveyResponseObject.answers.length; i++) {
    await answerObjectValidator.validate(
      surveyResponseObject.answers[i],
      (message, field) =>
        new ValidationError(
          `Answer at index ${i} had invalid field "${field}" causing the message "${message}"`,
        ),
    );
  }
}

async function translateSurveyResponseObject(models, surveyResponseObject) {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }

  const surveyResponseTranslators = constructSurveyResponseTranslators(models);
  const answerTranslators = constructAnswerTranslators(models);

  if (
    !requiresSurveyResponseTranslation(
      surveyResponseObject,
      surveyResponseTranslators,
      answerTranslators,
    )
  ) {
    return surveyResponseObject;
  }

  const translatedSurveyResponseObject = cloneDeep(surveyResponseObject);
  await translateObjectFields(translatedSurveyResponseObject, surveyResponseTranslators);

  const { answers } = translatedSurveyResponseObject;
  if (Array.isArray(answers)) {
    for (let i = 0; i < answers.length; i++) {
      await translateObjectFields(answers[i], answerTranslators);
    }
  }

  return translatedSurveyResponseObject;
}

const requiresSurveyResponseTranslation = (
  surveyResponseObject,
  surveyResponseTranslators,
  answerTranslators,
) => {
  const surveyResponseTranslatorFields = Object.keys(surveyResponseTranslators);
  if (
    Object.keys(surveyResponseObject).some(field => surveyResponseTranslatorFields.includes(field))
  ) {
    return true;
  }

  const answerTranslatorFields = Object.keys(answerTranslators);
  const { answers } = surveyResponseObject;
  if (Array.isArray(answers)) {
    return answers.some(
      answer =>
        answer.body === '' ||
        Object.keys(answer).some(field => answerTranslatorFields.includes(field)),
    );
  }

  return false;
};

const clinicOrEntityIdExist = (id, obj) => {
  if (!(obj.clinic_id || obj.entity_id)) {
    throw new Error('Either clinic_id or entity_id are required.');
  }
};

const constructSurveyResponseTranslators = models => ({
  user_email: userEmail => translateUserEmailToIdAndAssessorName(models.user, userEmail),
  entity_code: entityCode => translateEntityCodeToId(models.entity, entityCode),
  survey_code: surveyCode => translateSurveyCodeToId(models.survey, surveyCode),
  entities_created: entitiesCreated => ({ entities_upserted: entitiesCreated }),
  answers: answers => ({ answers: answers.filter(a => a.body !== '') }), // remove any empty answers
});

const constructAnswerTranslators = models => ({
  question_code: questionCode => translateQuestionCodeToId(models.question, questionCode),
});

const constructEntitiesUpsertedValidators = models => ({
  id: [hasContent, takesIdForm],
  code: [hasContent],
  parent_id: [takesIdForm],
  name: [hasContent],
  type: [constructIsValidEntityType(models.entity)],
  country_code: [hasContent],
});

const constructIsValidEntity = models => async value =>
  new ObjectValidator(constructEntitiesUpsertedValidators(models)).validate(value);

const constructOptionsCreatedValidators = models => ({
  id: [hasContent, takesIdForm],
  value: [hasContent],
  option_set_id: [hasContent, takesIdForm, constructRecordExistsWithId(models.optionSet)],
  sort_order: [isNumber],
});

const constructIsValidOption = models => async value =>
  new ObjectValidator(constructOptionsCreatedValidators(models)).validate(value);

const constructSurveyResponseValidators = models => ({
  id: [hasContent, takesIdForm],
  assessor_name: [hasContent],
  clinic_id: [clinicOrEntityIdExist, constructIsEmptyOr(takesIdForm)],
  entity_id: [clinicOrEntityIdExist, constructIsEmptyOr(takesIdForm)],
  start_time: [hasContent, takesDateForm],
  end_time: [hasContent, takesDateForm],
  survey_id: [hasContent, takesIdForm],
  user_id: [hasContent, takesIdForm],
  answers: [isPresent],
  entities_upserted: [constructIsEmptyOr(constructEveryItem(constructIsValidEntity(models)))],
  options_created: [constructIsEmptyOr(constructEveryItem(constructIsValidOption(models)))],
});

const constructAnswerValidators = models => ({
  id: [hasContent, takesIdForm],
  type: [hasContent],
  question_id: [hasContent, takesIdForm, constructRecordExistsWithId(models.question)],
  body: [hasContent],
});
