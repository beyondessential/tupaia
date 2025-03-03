import { useCallback } from 'react';
import * as yup from 'yup';
import { QuestionType } from '@tupaia/types';
import { SurveyScreenComponent } from '../../types';
import { getAllSurveyComponents, useSurveyForm } from '.';

const transformNumberValue = (value: string | number, originalValue: string | number) => {
  // This is a workaround for yup not handling empty number fields (https://github.com/jquense/yup/issues/298)
  return originalValue === '' || Number.isNaN(originalValue as number) ? null : value;
};

const getBaseSchema = (type: QuestionType) => {
  switch (type) {
    case QuestionType.Number:
      return yup.number().transform(transformNumberValue).nullable();
    case QuestionType.File:
      return yup
        .object()
        .shape({
          value: yup.string(),
          name: yup.string(),
        })
        .nullable()
        .default(null); // Allow this value to be empty to stop a typeError. The mandatory validation will handle this instead

    case QuestionType.Date:
    case QuestionType.SubmissionDate:
    case QuestionType.DateOfData:
    case QuestionType.DateTime:
      return yup
        .date()
        .nullable()
        .default(() => new Date());
    case QuestionType.Geolocate:
      return yup
        .object({
          latitude: yup
            .number()
            .max(90, 'Latitude must be between -90 and 90')
            .min(-90, 'Latitude must be between -90 and 90')
            .transform(transformNumberValue),
          longitude: yup
            .number()
            .max(180, 'Longitude must be between -180 and 180')
            .min(-180, 'Longitude must be between -180 and 180')
            .transform(transformNumberValue),
        })
        .nullable()
        .default(() => ({}));
    case QuestionType.User:
      return yup
        .object()
        .shape({
          id: yup.string(),
          name: yup.string(),
        })
        .nullable()
        .default(null); // Allow this value to be empty to stop a typeError. The mandatory validation will handle this instead
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
      let fieldSchema = getBaseSchema(type);

      if (mandatory) {
        fieldSchema = fieldSchema.required('Required');
        // add custom validation for geolocate only when the question is required, so that the validation doesn't happen on each subfield when the question is not required
        if (type === QuestionType.Geolocate) {
          // @ts-ignore - handle issue with union type on schema from yup
          fieldSchema = fieldSchema.test(
            'hasLatLong',
            ({ value }) => {
              // Show the required message when the user has not entered a location at all
              if (
                (!value?.latitude && !value?.longitude) ||
                (Number.isNaN(value.latitude) && Number.isNaN(value.longitude))
              )
                return 'Required';
              // Otherwise show the invalid location message
              return 'Please enter a valid location';
            },
            value =>
              value?.latitude &&
              value?.longitude &&
              !Number.isNaN(value.latitude) &&
              !Number.isNaN(value.longitude),
          );
        }
      }

      if (min !== undefined) {
        fieldSchema = (fieldSchema as yup.NumberSchema).min(min, `Minimum value is ${min}`);
      }
      if (max !== undefined) {
        fieldSchema = (fieldSchema as yup.NumberSchema).max(max, `Maximum value is ${max}`);
      }

      return {
        ...schema,
        [questionId]: fieldSchema,
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
            const questionName = currentError.path?.split('.')[0];
            return {
              ...allErrors,
              [questionName]: {
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
