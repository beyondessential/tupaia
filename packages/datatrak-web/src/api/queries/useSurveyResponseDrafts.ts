import { useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import { ensure } from '@tupaia/tsutils';
import { DatatrakWebSurveyResponseDraftsRequest, EntityTypeEnum } from '@tupaia/types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery, type ContextualQueryFunctionContext } from './useDatabaseQuery';

type DraftSurveyResponse = DatatrakWebSurveyResponseDraftsRequest.DraftSurveyResponse;
type PageResponse = DatatrakWebSurveyResponseDraftsRequest.ResBody;

interface DraftsQueryContext extends ContextualQueryFunctionContext {
  userId?: string;
  projectId?: string;
}

const localQueryFunction = async ({
  models,
  userId,
  projectId,
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

  // Filter by project if specified
  const filteredDrafts = projectId
    ? drafts.filter(draft => {
        const survey = draft.survey_id ? surveyMap.get(draft.survey_id) : null;
        return survey?.project_id === projectId;
      })
    : drafts;

  // Batch fetch country entities by country_code
  const countryCodes = [
    ...new Set(
      filteredDrafts
        .map(d => d.country_code ?? entityMap.get(d.entity_id as string)?.country_code)
        .filter((code): code is string => Boolean(code)),
    ),
  ];
  const countryEntities =
    countryCodes.length > 0
      ? await models.entity.find({ code: countryCodes, type: EntityTypeEnum.country })
      : [];
  const countryMap = new Map(countryEntities.map(c => [c.code, c.name]));

  return {
    items: filteredDrafts.map(draft => {
      const survey = draft.survey_id ? surveyMap.get(draft.survey_id) : null;
      const entity = draft.entity_id ? entityMap.get(draft.entity_id) : null;
      const countryCode = draft.country_code ?? entity?.country_code ?? null;

      return {
        id: draft.id,
        surveyId: draft.survey_id,
        surveyCode: survey?.code ?? null,
        surveyName: survey?.name ?? null,
        countryCode,
        countryName: countryCode ? countryMap.get(countryCode) ?? null : null,
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

export const useSurveyResponseDrafts = ({
  enabled = true,
  ...rest
}: UseQueryOptions<DatatrakWebSurveyResponseDraftsRequest.ResBody> = {}) => {
  const isOfflineFirst = useIsOfflineFirst();
  const { id: userId, projectId } = useCurrentUserContext();

  // Offline-first: load all drafts at once via local database
  const offlineResult = useDatabaseQuery<PageResponse>(
    ['surveyResponseDrafts', 'offline', projectId],
    localQueryFunction,
    {
      enabled: isOfflineFirst && Boolean(userId) && enabled,
      ...rest,
      localContext: { userId, projectId },
    },
  );

  // Remote: paginated infinite query
  const remoteResult = useInfiniteQuery(
    ['surveyResponseDrafts', projectId],
    ({ pageParam = 0 }): Promise<PageResponse> =>
      get('surveyResponseDrafts', { params: { page: pageParam, pageLimit: 6, projectId } }),
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
