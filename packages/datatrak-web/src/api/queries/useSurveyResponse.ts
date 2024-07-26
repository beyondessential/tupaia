/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { DatatrakWebSingleSurveyResponseRequest, QuestionType } from '@tupaia/types';
import { get } from '../api';
import { ROUTES } from '../../constants';
import { errorToast } from '../../utils';
import { getAllSurveyComponents, useSurveyForm } from '../../features';

export const useSurveyResponse = (surveyResponseId?: string) => {
  const { setFormData, surveyScreens } = useSurveyForm();
  const navigate = useNavigate();

  const flattenedScreenComponents = getAllSurveyComponents(surveyScreens);

  return useQuery(
    ['surveyResponse', surveyResponseId],
    (): Promise<DatatrakWebSingleSurveyResponseRequest.ResBody> =>
      get(`surveyResponse/${surveyResponseId}`),
    {
      enabled: !!surveyResponseId,
      meta: {
        applyCustomErrorHandling: true,
      },
      onError(error: any) {
        if (error.code === 403)
          return navigate(ROUTES.NOT_AUTHORISED, { state: { errorMessage: error.message } });
        errorToast(error.message);
      },
      onSuccess: data => {
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
          const question = flattenedScreenComponents.find(
            component => component.questionId === key,
          );
          if (!question) return acc;
          if (question.type === QuestionType.File && value) {
            return { ...acc, [key]: { name: value, value } };
          }

          return { ...acc, [key]: isStringifiedObject ? JSON.parse(value) : value };
        }, {});

        if (primaryEntityQuestion && data.entityId) {
          formattedAnswers[primaryEntityQuestion.questionId] = data.entityId;
        }

        if (dateOfDataQuestion && data.dataTime) {
          formattedAnswers[dateOfDataQuestion.questionId] = new Date(data.dataTime);
        }

        setFormData(formattedAnswers);
      },
    },
  );
};
