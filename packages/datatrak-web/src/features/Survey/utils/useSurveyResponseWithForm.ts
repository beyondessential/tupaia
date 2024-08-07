/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { DatatrakWebSingleSurveyResponseRequest, QuestionType } from '@tupaia/types';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSurvey } from '../../../api';
import { useSurveyForm } from '../SurveyContext';
import { getAllSurveyComponents } from '../utils';

/**
 * Utility hook to process survey response data and populate the form with it
 */
export const useSurveyResponseWithForm = (
  surveyResponse?: DatatrakWebSingleSurveyResponseRequest.ResBody,
) => {
  const { setFormData, surveyScreens, surveyCode } = useSurveyForm();

  const { isLoading, isFetched } = useSurvey(surveyCode);
  const surveyLoading = isLoading || !isFetched;
  const formContext = useFormContext();

  const flattenedScreenComponents = getAllSurveyComponents(surveyScreens);

  // Populate the form with the survey response data - this is not in in the onSuccess hook because it doesn't get called if the response has previously been fetched and is in the cache
  useEffect(() => {
    if (!surveyResponse || surveyLoading) return;
    const primaryEntityQuestion = flattenedScreenComponents.find(
      component => component.type === QuestionType.PrimaryEntity,
    );

    const dateOfDataQuestion = flattenedScreenComponents.find(
      component =>
        component.type === QuestionType.DateOfData ||
        component.type === QuestionType.SubmissionDate,
    );
    // handle updating answers here - if this is done in the component, the answers get reset on every re-render
    const formattedAnswers = Object.entries(surveyResponse.answers).reduce((acc, [key, value]) => {
      // If the value is a stringified object, parse it
      const isStringifiedObject = typeof value === 'string' && value.startsWith('{');
      const question = flattenedScreenComponents.find(component => component.questionId === key);
      if (!question) return acc;
      if (question.type === QuestionType.File && value) {
        return { ...acc, [key]: { name: value, value: null } };
      }

      return { ...acc, [key]: isStringifiedObject ? JSON.parse(value) : value };
    }, {});

    // Add the primary entity and date of data to the form data
    if (primaryEntityQuestion && surveyResponse.entityId) {
      formattedAnswers[primaryEntityQuestion.questionId] = surveyResponse.entityId;
    }

    if (dateOfDataQuestion && surveyResponse.dataTime) {
      formattedAnswers[dateOfDataQuestion.questionId] = surveyResponse.dataTime;
    }

    setFormData(formattedAnswers);
    // Reset the form context with the new answers, to trigger re-render of the form
    formContext.reset(formattedAnswers);
  }, [JSON.stringify(surveyResponse), surveyLoading]);

  return { surveyLoading };
};
