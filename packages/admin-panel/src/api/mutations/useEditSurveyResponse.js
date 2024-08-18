/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useApiContext } from '../../utilities/ApiProvider';

export const useEditSurveyResponse = (surveyResponseId, updatedSurveyResponse) => {
  const queryClient = useQueryClient();
  const api = useApiContext();
  return useMutation(
    [`surveyResponseEdit`, surveyResponseId, updatedSurveyResponse],
    () => {
      return api.put(`surveyResponses/${surveyResponseId}`, null, updatedSurveyResponse);
    },
    {
      throwOnError: true,
      onSuccess: async () => {
        // invalidate the survey response data
        await queryClient.invalidateQueries(['surveyResubmitData', surveyResponseId]);
        return 'completed';
      },
    },
  );
};
