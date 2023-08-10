/*
 * Tupaia
 * Copyright (c) 2017 - 20211Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from 'react-query';
import { useApi } from '../../utilities/ApiProvider';

export const useResubmitSurveyResponse = (
  surveyResponseId,
  updatedSurveyResponse,
  filesByQuestionCode,
) => {
  const api = useApi();
  return useMutation(
    [`surveyResubmit`, surveyResponseId, updatedSurveyResponse],
    () => {
      return api.multipartPost({
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
};
