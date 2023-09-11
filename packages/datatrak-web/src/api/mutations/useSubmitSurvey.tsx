/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { post } from '../api';

type RequestBody = {
  surveyId: string;
  surveyResponse: Record<string, unknown>;
};
export const useSubmitSurvey = () => {
  return useMutation<any, Error, RequestBody, unknown>(
    ({ surveyId, surveyResponse }: RequestBody) => {
      return post('surveyResponse', {
        data: {
          surveyId,
          surveyResponse,
        },
      });
    },
  );
};
