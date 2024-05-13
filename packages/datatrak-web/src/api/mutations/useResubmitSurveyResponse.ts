/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useParams } from 'react-router';

type Answer = string | number | boolean | null | undefined;

export type AnswersT = Record<string, Answer>;

export const useResubmitSurveyResponse = () => {
  const { surveyResponseId } = useParams();
  return useMutation<any, Error, AnswersT, unknown>(async (answers: AnswersT) => {
    if (!answers) {
      return;
    }
    console.log('surveyResponseId', answers);

    //   return post('submitSurvey', {
    //     data: { ...surveyResponseData, answers },
    //   });
  });
};
