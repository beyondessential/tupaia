import { useQueryClient } from '@tanstack/react-query';
import { ensure } from '@tupaia/tsutils';
import { remove } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseMutation, ContextualMutationFunctionContext } from '../queries';
import { deleteSurveyResponseDraft } from '../../database';

type LocalContext = { draftId?: string };

interface DeleteDraftMutationContext
  extends ContextualMutationFunctionContext<void>,
    LocalContext {}

const deleteRemote = async ({ draftId }: DeleteDraftMutationContext) =>
  remove(`surveyResponseDrafts/${ensure(draftId)}`);

export const useDeleteSurveyResponseDraft = (draftId?: string) => {
  const queryClient = useQueryClient();
  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseMutation<{ message: string }, Error, void, unknown, LocalContext>(
    isOfflineFirst ? deleteSurveyResponseDraft : deleteRemote,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['surveyResponseDrafts']);
      },
      localContext: { draftId },
    },
  );
};
