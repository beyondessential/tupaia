import { useQueryClient } from '@tanstack/react-query';
import { DatatrakWebUpdateSurveyResponseDraftRequest } from '@tupaia/types';
import { ensure } from '@tupaia/tsutils';
import { put } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation, ContextualMutationFunctionContext } from '../queries';
import { updateSurveyResponseDraft } from '../../database';

type UpdateDraftData = DatatrakWebUpdateSurveyResponseDraftRequest.ReqBody;

type LocalContext = { draftId?: string };

interface UpdateDraftMutationContext
  extends ContextualMutationFunctionContext<UpdateDraftData>,
    LocalContext {}

const updateRemote = async ({ draftId, data }: UpdateDraftMutationContext) =>
  put(`surveyResponseDrafts/${ensure(draftId)}`, { data });

export const useUpdateSurveyResponseDraft = (draftId?: string) => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseMutation<{ message: string }, Error, UpdateDraftData, unknown, LocalContext>(
    isOfflineFirst ? updateSurveyResponseDraft : updateRemote,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['surveyResponseDrafts']);
      },
      localContext: { draftId },
    },
  );
};
