/*
 * Tupaia
 * Copyright (c) 2017 - 20211Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from 'react-query';
import { useApiContext } from '../../utilities/ApiProvider';

export const useResubmitSurveyResponse = (
  surveyResponseId,
  updatedSurveyResponse,
  filesByQuestionCode,
) => {
  const api = useApiContext();
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
