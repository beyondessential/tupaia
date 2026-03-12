import { useQueryClient } from '@tanstack/react-query';
import { DatatrakWebSaveSurveyResponseDraftRequest } from '@tupaia/types';
import { post } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation, ContextualMutationFunctionContext } from '../queries';
import { createSurveyResponseDraft } from '../../database';

type SaveDraftData = DatatrakWebSaveSurveyResponseDraftRequest.ReqBody;

interface SaveDraftMutationContext extends ContextualMutationFunctionContext<SaveDraftData> {}

const saveRemote = async ({ data }: SaveDraftMutationContext) => {
  return await post('surveyResponseDrafts', { data });
};

export const useSaveSurveyResponseDraft = () => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseMutation<{ id: string }, Error, SaveDraftData, unknown>(
    isOfflineFirst ? createSurveyResponseDraft : saveRemote,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['surveyResponseDrafts']);
      },
    },
  );
};
