/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useFormContext } from 'react-hook-form';
import { DatatrakWebSingleSurveyResponseRequest, QuestionType } from '@tupaia/types';
import { get } from '../api';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { useSurvey } from './useSurvey';

export const useSurveyResponse = (
  surveyResponseId?: string | null,
  options?: Record<string, unknown> & { enabled?: boolean },
) => {
  return useQuery(
    ['surveyResponse', surveyResponseId],
    (): Promise<DatatrakWebSingleSurveyResponseRequest.ResBody> =>
      get(`surveyResponse/${surveyResponseId}`),
    {
      enabled: !!surveyResponseId && options?.enabled !== false,
      ...options,
    },
  );
};

/**
 * Utility hook to fetch survey response data and populate the form with it
 */
export const useSurveyResponseWithForm = (surveyResponseId?: string | null) => {
  const { setFormData, surveyScreens, surveyCode } = useSurveyForm();

  const { isLoading, isFetched } = useSurvey(surveyCode);
  const surveyLoading = isLoading || !isFetched;
  const formContext = useFormContext();

  const flattenedScreenComponents = getAllSurveyComponents(surveyScreens);
  const queryResult = useSurveyResponse(surveyResponseId, {
    enabled: !surveyLoading,
    meta: {
      applyCustomErrorHandling: true,
    },
  });

  // Populate the form with the survey response data - this is not in in the onSuccess hook because it doesn't get called if the response has previously been fetched and is in the cache
  useEffect(() => {
    const { data } = queryResult;
    if (!data) return;
    const primaryEntityQuestion = flattenedScreenComponents.find(
      component => component.type === QuestionType.PrimaryEntity,
    );

    const dateOfDataQuestion = flattenedScreenComponents.find(
      component =>
        component.type === QuestionType.DateOfData ||
        component.type === QuestionType.SubmissionDate,
    );
    // handle updating answers here - if this is done in the component, the answers get reset on every re-render
    const formattedAnswers = Object.entries(data.answers).reduce((acc, [key, value]) => {
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
    if (primaryEntityQuestion && data.entityId) {
      formattedAnswers[primaryEntityQuestion.questionId] = data.entityId;
    }

    if (dateOfDataQuestion && data.dataTime) {
      formattedAnswers[dateOfDataQuestion.questionId] = data.dataTime;
    }

    setFormData(formattedAnswers);
    // Reset the form context with the new answers, to trigger re-render of the form
    formContext.reset(formattedAnswers);
  }, [JSON.stringify(queryResult.data)]);

  return queryResult;
};
