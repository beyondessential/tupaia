/*
 * Tupaia
 * Copyright (c) 2017 - 20211Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from 'react-query';
import { post } from '../../VizBuilderApp/api/api';

export const useResubmitSurveyResponse = (surveyResponseId, updatedSurveyResponse) =>
  useMutation(
    [`surveyResubmit`, surveyResponseId, updatedSurveyResponse],
    () => {
      return post(`surveyResponse/${surveyResponseId}/resubmit`, {
        data: { updatedSurveyResponse },
      });
    },
    {
      throwOnError: true,
    },
  );
