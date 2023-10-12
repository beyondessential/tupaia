import { useCallback } from 'react';
import * as yup from 'yup';
import { getAllSurveyComponents, useSurveyForm } from '.';
import { QuestionType } from '@tupaia/types';

export const useValidationResolver = () => {
  const { visibleScreens, activeScreen, isLast, formData } = useSurveyForm();
  const allSurveyComponents = getAllSurveyComponents(visibleScreens);

  const componentsToValidate = isLast ? allSurveyComponents : activeScreen;

  const validationSchema =
    componentsToValidate?.reduce((schema, component) => {
      const { questionId, type, validationCriteria = {} } = component;
      const { mandatory, min, max } = validationCriteria;

      const questionName = type === QuestionType.PrimaryEntity ? 'entityId' : questionId;

      if (!mandatory && !min && !max) return schema;

      const getBaseSchema = () => {
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

      let fieldSchema = getBaseSchema();

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
    }, {}) ?? {};

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
