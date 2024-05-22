/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { generatePath, useNavigate, useParams } from 'react-router';
import { QuestionType } from '@tupaia/types';
import { getUniqueSurveyQuestionFileName } from '@tupaia/utils';
import { post } from '../api';
import { getAllSurveyComponents, useSurveyForm } from '../../features';
import { SurveyScreenComponent } from '../../types';
import { ROUTES } from '../../constants';
import { AnswersT, isFileUploadAnswer } from './useSubmitSurveyResponse';

const processAnswers = (
  answers: AnswersT,
  questionsById: Record<string, SurveyScreenComponent>,
) => {
  const files: File[] = [];
  const formattedAnswers = Object.entries(answers).reduce((acc, [questionId, answer]) => {
    const { code, type } = questionsById[questionId];
    if (!code) return acc;

    if (type === QuestionType.File && isFileUploadAnswer(answer) && answer.value instanceof File) {
      // Create a new file with a unique name, and add it to the files array, so we can add to the FormData, as this is what the central server expects
      const uniqueFileName = getUniqueSurveyQuestionFileName(answer.name);
      files.push(
        new File([answer.value as Blob], uniqueFileName, {
          type: answer.value.type,
        }),
      );
      return {
        ...acc,
        [code]: uniqueFileName,
      };
    }
    return {
      ...acc,
      [code]: answer,
    };
  }, {});

  return {
    answers: formattedAnswers,
    files,
  };
};

export const useResubmitSurveyResponse = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { surveyResponseId } = params;
  const { surveyScreens, resetForm } = useSurveyForm();
  const allScreenComponents = getAllSurveyComponents(surveyScreens);
  const questionsById = allScreenComponents.reduce((acc, component) => {
    return {
      ...acc,
      [component.questionId]: component,
    };
  }, {});
  return useMutation<any, Error, AnswersT, unknown>(
    async (surveyAnswers: AnswersT) => {
      if (!surveyAnswers) {
        return;
      }
      const { answers, files } = processAnswers(surveyAnswers, questionsById);

      const formData = new FormData();
      formData.append('payload', JSON.stringify({ answers }));
      files.forEach(file => {
        formData.append(file.name, file);
      });

      return post(`surveyResponse/${surveyResponseId}/resubmit`, {
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    {
      onSuccess: () => {
        resetForm();
        navigate(generatePath(ROUTES.SURVEY_RESUBMIT_SUCCESS, params));
      },
    },
  );
};
