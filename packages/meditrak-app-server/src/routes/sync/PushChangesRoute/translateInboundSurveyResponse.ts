import { cloneDeep } from 'es-toolkit/compat';
import { ValidationError } from '@tupaia/utils';
import { Entity } from '@tupaia/types';
import { RawSurveyResponseObject } from './types';

const SURVEY_RESPONSE_TRANSLATORS = {
  entities_created: async (entities_created: Entity[]) => ({ entities_upserted: entities_created }), // Map legacy key to new key
  answers: async (answers: { body: string }[]) => ({ answers: answers.filter(a => a.body !== '') }), // remove any empty answers
};

type Translator<T> = {
  [key in keyof T]?: (fieldValue: any) => Promise<RawSurveyResponseObject>;
};

const translateObjectFields = async <T extends RawSurveyResponseObject>(
  object: T,
  objectTranslators: Translator<T>,
) => {
  await Promise.all(
    Object.entries(object).map(async ([field, value]) => {
      const translator = Object.hasOwn(objectTranslators, field)
        ? objectTranslators[field]
        : undefined;
      if (translator) {
        const newFields = await translator(value);
        // eslint-disable-next-line no-param-reassign
        delete object[field];
        for (const [newField, newValue] of Object.entries(newFields)) {
          // eslint-disable-next-line no-param-reassign
          object[newField as keyof T] = newValue as T[keyof T];
        }
      }
    }),
  );
};

const requiresSurveyResponseTranslation = (surveyResponseObject: RawSurveyResponseObject) => {
  if (
    Object.keys(surveyResponseObject).some(field =>
      Object.hasOwn(SURVEY_RESPONSE_TRANSLATORS, field),
    )
  ) {
    return true;
  }

  const { answers } = surveyResponseObject;
  if (Array.isArray(answers)) {
    return answers.some(answer => answer.body === '');
  }

  return false;
};

export async function translateSurveyResponseObject(
  surveyResponseObject?: RawSurveyResponseObject,
) {
  if (!surveyResponseObject) {
    throw new ValidationError('Payload must contain survey_response_object');
  }

  if (!requiresSurveyResponseTranslation(surveyResponseObject)) {
    return surveyResponseObject;
  }

  const translatedSurveyResponseObject = cloneDeep(surveyResponseObject);
  await translateObjectFields(translatedSurveyResponseObject, SURVEY_RESPONSE_TRANSLATORS);

  return translatedSurveyResponseObject;
}
