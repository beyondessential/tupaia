import { ensure } from '@tupaia/tsutils';
import { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery, type ContextualQueryFunctionContext } from './useDatabaseQuery';

interface DraftsQueryContext extends ContextualQueryFunctionContext {
  userId?: string;
}

const queryFunctions = {
  local: async ({ models, userId }: DraftsQueryContext) => {
    const drafts = await models.surveyResponseDraft.find(
      { user_id: ensure(userId) },
      { sort: ['updated_at DESC'] },
    );

    return Promise.all(
      drafts.map(async draft => {
        const survey = draft.survey_id ? await models.survey.findById(draft.survey_id) : null;
        const entity = draft.entity_id ? await models.entity.findById(draft.entity_id) : null;

        return {
          id: draft.id,
          surveyId: draft.survey_id,
          surveyCode: survey?.code ?? null,
          surveyName: survey?.name ?? null,
          countryCode: draft.country_code ?? entity?.country_code ?? null,
          entityId: draft.entity_id ?? null,
          entityName: entity?.name ?? null,
          startTime: draft.start_time ?? null,
          formData: draft.form_data,
          screenNumber: draft.screen_number,
          updatedAt: draft.updated_at,
        };
      }),
    );
  },
  remote: async (): Promise<DatatrakWebSurveyResponseDraftsRequest.ResBody> =>
    get('surveyResponseDrafts'),
} as const;

export const useSurveyResponseDrafts = () => {
  const isOfflineFirst = useIsOfflineFirst();
  const { id: userId } = useCurrentUserContext();
  const localContext = { userId };

  return useDatabaseQuery<DatatrakWebSurveyResponseDraftsRequest.ResBody>(
    ['surveyResponseDrafts'],
    isOfflineFirst ? queryFunctions.local : queryFunctions.remote,
    {
      enabled: Boolean(userId),
      localContext,
    },
  );
};
