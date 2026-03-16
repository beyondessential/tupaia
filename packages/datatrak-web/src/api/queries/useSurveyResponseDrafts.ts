import { useInfiniteQuery } from '@tanstack/react-query';
import { ensure } from '@tupaia/tsutils';
import { DatatrakWebSurveyResponseDraftsRequest } from '@tupaia/types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery, type ContextualQueryFunctionContext } from './useDatabaseQuery';

type DraftSurveyResponse = DatatrakWebSurveyResponseDraftsRequest.DraftSurveyResponse;
type PageResponse = DatatrakWebSurveyResponseDraftsRequest.ResBody;

interface DraftsQueryContext extends ContextualQueryFunctionContext {
  userId?: string;
}

const localQueryFunction = async ({
  models,
  userId,
}: DraftsQueryContext): Promise<PageResponse> => {
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

  return {
    items: drafts.map(draft => {
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
    }),
    hasMorePages: false,
    pageNumber: 0,
  };
};

const noop = () => {};

export const useSurveyResponseDrafts = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const isOfflineFirst = useIsOfflineFirst();
  const { id: userId } = useCurrentUserContext();

  // Offline-first: load all drafts at once via local database
  const offlineResult = useDatabaseQuery<PageResponse>(
    ['surveyResponseDrafts', 'offline'],
    localQueryFunction,
    {
      enabled: isOfflineFirst && Boolean(userId) && enabled,
      localContext: { userId },
    },
  );

  // Remote: paginated infinite query
  const remoteResult = useInfiniteQuery(
    ['surveyResponseDrafts'],
    ({ pageParam = 0 }): Promise<PageResponse> =>
      get('surveyResponseDrafts', { params: { page: pageParam } }),
    {
      getNextPageParam: data => {
        if (!data) return 0;
        return data.hasMorePages ? data.pageNumber + 1 : undefined;
      },
      enabled: !isOfflineFirst && Boolean(userId) && enabled,
    },
  );

  if (isOfflineFirst) {
    return {
      data: offlineResult.data?.items ?? ([] as DraftSurveyResponse[]),
      fetchNextPage: noop,
      hasNextPage: false,
      isFetching: false,
      isLoading: offlineResult.isLoading,
    };
  }

  return {
    data: remoteResult.data?.pages.flatMap(p => p.items) ?? ([] as DraftSurveyResponse[]),
    fetchNextPage: remoteResult.fetchNextPage,
    hasNextPage: remoteResult.hasNextPage ?? false,
    isFetching: remoteResult.isFetching,
    isLoading: remoteResult.isLoading,
  };
};
