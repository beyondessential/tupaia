/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { useApiContext } from '../../utilities/ApiProvider';

export const useResubmitSurveyResponse = (surveyResponseId, updatedSurveyResponse, onSuccess) => {
  const api = useApiContext();
  return useMutation(
    [`surveyResubmit`, surveyResponseId, updatedSurveyResponse],
    () => {
      return api.multipartPost({
        endpoint: `surveyResponse/${surveyResponseId}/resubmit`,
        payload: {
          ...updatedSurveyResponse,
        },
      });
    },
    {
      throwOnError: true,
      onSuccess,
    },
  );
};
