/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useCallback } from 'react';
import * as yup from 'yup';
import { QuestionType } from '@tupaia/types';
import { getAllSurveyComponents, useSurveyForm } from '.';
import { SurveyScreenComponent } from '../../types';

const getBaseSchema = (type: QuestionType) => {
  switch (type) {
    case QuestionType.Number:
      return yup
        .number()
        .transform((value: string, originalValue: string) => {
          // This is a workaround for yup not handling empty number fields (https://github.com/jquense/yup/issues/298)
          return originalValue === '' ? null : value;
        })
        .nullable();
    case QuestionType.Autocomplete:
      return yup
        .object()
        .shape({
          value: yup.string(),
        })
        .nullable(); // Allow this value to be empty to stop a typeError. The mandatory validation will handle this instead
    case QuestionType.Date:
    case QuestionType.SubmissionDate:
    case QuestionType.DateOfData:
    case QuestionType.DateTime:
      return yup
        .date()
        .nullable()
        .default(() => new Date());
    default:
      return yup.string();
  }
};

const getValidationSchema = (screenComponents?: SurveyScreenComponent[]) => {
  return (
    screenComponents?.reduce((schema, component) => {
      const { questionId, type, validationCriteria } = component;
      const { mandatory, min, max } = validationCriteria || {};

      if (!mandatory && !min && !max) return schema;

      const questionName = type === QuestionType.PrimaryEntity ? 'entityId' : questionId;

      let fieldSchema = getBaseSchema(type);

      if (mandatory) {
        fieldSchema = fieldSchema.required('Required');
      }

      if (min !== undefined) {
        fieldSchema = (fieldSchema as yup.NumberSchema).min(min, `Minimum value is ${min}`);
      }
      if (max !== undefined) {
        fieldSchema = (fieldSchema as yup.NumberSchema).max(max, `Maximum value is ${max}`);
      }

      return {
        ...schema,
        [questionName]: fieldSchema,
      };
    }, {}) ?? {}
  );
};

export const useValidationResolver = () => {
  const { visibleScreens, activeScreen, isLast, formData } = useSurveyForm();
  const allSurveyComponents = getAllSurveyComponents(visibleScreens);

  const componentsToValidate = isLast ? allSurveyComponents : activeScreen;

  const validationSchema = getValidationSchema(componentsToValidate);

  const yupSchema = yup.object().shape(validationSchema);

  return useCallback(
    async data => {
      try {
        const values = await yupSchema.validate(
          {
            ...formData,
            ...data,
          },
          {
            abortEarly: false,
          },
        );

        return {
          values,
          errors: {},
        };
      } catch (errors: any) {
        return {
          values: {},
          errors: errors?.inner?.reduce((allErrors, currentError) => {
            return {
              ...allErrors,
              [currentError.path]: {
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            };
          }, {}),
        };
      }
    },
    [yupSchema],
  );
};
