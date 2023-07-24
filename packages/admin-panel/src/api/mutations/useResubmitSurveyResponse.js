/*
 * Tupaia
 * Copyright (c) 2017 - 20211Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from 'react-query';
import { multipart } from '../../VizBuilderApp/api/api';

export const useResubmitSurveyResponse = (
  surveyResponseId,
  updatedSurveyResponse,
  filesByQuestionCode,
) =>
  useMutation(
    [`surveyResubmit`, surveyResponseId, updatedSurveyResponse],
    () => {
      return multipart({
        method: 'post',
        endpoint: `surveyResponse/${surveyResponseId}/resubmit`,
        filesByMultipartKey: filesByQuestionCode,
        payload: {
          ...updatedSurveyResponse,
        },
      });
    },
    {
      throwOnError: true,
    },
  );
