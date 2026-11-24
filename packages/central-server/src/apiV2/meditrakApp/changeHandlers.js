import { cloneDeep } from 'es-toolkit/compat';

import {
  constructEveryItem,
  constructIsEmptyOr,
  constructIsValidEntityType,
  constructRecordExistsWithId,
  hasContent,
  isNumber,
  isPresent,
  ObjectValidator,
  takesDateForm,
  takesIdForm,
  ValidationError,
} from '@tupaia/utils';
import {
  translateEntityCodeToId,
  translateObjectFields,
  translateQuestionCodeToId,
  translateSurveyCodeToId,
  translateUserEmailToIdAndAssessorName,
} from '../utilities';
import { addSurveyFile, addSurveyImage, updateOrCreateSurveyResponse } from './utilities';

export const ACTIONS = /** @type {const} */ ({
  SubmitSurveyResponse: 'SubmitSurveyResponse',
  AddSurveyImage: 'AddSurveyImage',
  AddSurveyFile: 'AddSurveyFile',
});

/**
 * Maps each supported change action to the functions that process it. Each accepts the models and
 * payload:
 * - `translate`: translates the data so that the required fields are present, returning the
 *   translated payload
 * - `validate`: validates that the translated payload contains the requisite content, throwing an
 *   error if not
 * - `handle`: integrates the translated payload into the database
 *
 * This is a Map rather than a plain object so that a user-supplied action can only ever resolve to
 * one of these entries (no inherited properties, no key coercion).
 */
export const CHANGE_HANDLERS = new Map([
  [
    ACTIONS.SubmitSurveyResponse,
    {
      // LEGACY: v1 and v2 allow survey_response object, v3 should deprecate this
      translate: async (models, payload) =>
        translateSurveyResponseObject(models, payload?.survey_response || payload),
      validate: async (models, payload) =>
        validateSurveyResponseObject(models, payload?.survey_response || payload),
      handle: async (models, payload) =>
        updateOrCreateSurveyResponse(models, payload.survey_response || payload),
    },
  ],

  /**
   * AddSurveyImage works in conjunction with SubmitSurveyResponse:
   * - SurveyResponse: The answer for the photo question has an id.
   * - AddSurveyImage: The payload is { id, data } where id matches the one in the answer.
   *
   * The file is uploaded to an S3 bucket to a deterministic url based on this id.
   * The SurveyResponse action handler swaps out any photo answers for their deterministic url, assuming it has been uploaded to that url.
   */
  [
    ACTIONS.AddSurveyImage,
    {
      translate: (_models, payload) => payload, // No translation required
      validate: async (_models, payload) => {
        const validator = new ObjectValidator({ id: [hasContent], data: [hasContent] });
        await validator.validate(payload);
      },
      handle: addSurveyImage,
    },
  ],

  /**
   * AddSurveyFile works very much like AddSurveyImage, but links with SubmitSurveyResponse by `uniqueFileName` instead of `id`
   */
  [
    ACTIONS.AddSurveyFile,
    {
      translate: (_models, payload) => payload, // No translation required
      validate: async (_models, payload) => {
        const validator = new ObjectValidator({
          id: [hasContent],
          uniqueFileName: [hasContent],
          data: [hasContent],
        });
        await validator.validate(payload);
      },
      handle: addSurveyFile,
    },
  ],
]);

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
    for (const answer of answers) {
      await translateObjectFields(answer, answerTranslators);
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
