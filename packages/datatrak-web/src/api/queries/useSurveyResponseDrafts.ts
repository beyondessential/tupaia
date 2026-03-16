import { UseQueryOptions } from '@tanstack/react-query';
import { ensure } from '@tupaia/tsutils';
import { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery, type ContextualQueryFunctionContext } from './useDatabaseQuery';

interface DraftsQueryContext extends ContextualQueryFunctionContext {
  userId?: string;
}

interface DraftsQueryFunction {
  (context: DraftsQueryContext): Promise<DatatrakWebSurveyResponseDraftsRequest.ResBody>;
}

const queryFunctions = {
  local: async ({ models, userId }: DraftsQueryContext) => {
    const drafts = await models.surveyResponseDraft.find(
      { user_id: ensure(userId) },
      { sort: ['updated_at DESC'] },
    );

    // Fetch all surveys and entities in batches to avoid N+1 queries
    const surveyIds = [
      ...new Set(drafts.map(d => d.survey_id).filter((id): id is string => Boolean(id))),
    ];
    const entityIds = [
      ...new Set(drafts.map(d => d.entity_id).filter((id): id is string => Boolean(id))),
    ];

    const [surveys, entities] = await Promise.all([
      surveyIds.length > 0 ? models.survey.find({ id: surveyIds }) : Promise.resolve([]),
      entityIds.length > 0 ? models.entity.find({ id: entityIds }) : Promise.resolve([]),
    ]);

    const surveyMap = new Map(surveys.map(s => [s.id, s]));
    const entityMap = new Map(entities.map(e => [e.id, e]));

    return drafts.map(draft => {
      const survey = draft.survey_id ? surveyMap.get(draft.survey_id) : null;
      const entity = draft.entity_id ? entityMap.get(draft.entity_id) : null;

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
    });
  },
  remote: async (): Promise<DatatrakWebSurveyResponseDraftsRequest.ResBody> =>
    get('surveyResponseDrafts'),
} as const satisfies Record<'local' | 'remote', DraftsQueryFunction>;

export const useSurveyResponseDrafts = ({
  enabled = true,
  ...rest
}: UseQueryOptions<DatatrakWebSurveyResponseDraftsRequest.ResBody> = {}) => {
  const isOfflineFirst = useIsOfflineFirst();
  const { id: userId } = useCurrentUserContext();
  const localContext = { userId };

  return useDatabaseQuery<DatatrakWebSurveyResponseDraftsRequest.ResBody>(
    ['surveyResponseDrafts'],
    isOfflineFirst ? queryFunctions.local : queryFunctions.remote,
    {
      enabled: Boolean(userId) && enabled,
      ...rest,
      localContext,
    },
  );
};
