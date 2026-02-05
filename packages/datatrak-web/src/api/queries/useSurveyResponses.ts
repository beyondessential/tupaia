import { camelcaseKeys } from '@tupaia/tsutils';
import type { DatatrakWebSurveyResponsesRequest, Project, UserAccount } from '@tupaia/types';
import { useCurrentUserContext } from '../CurrentUserContext';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery, type ContextualQueryFunctionContext } from './useDatabaseQuery';

interface SurveyResponsesQueryFunctionContext extends ContextualQueryFunctionContext {
  userId?: UserAccount['id'];
  projectId?: Project['id'];
}

const queryFunctions = {
  local: async ({
    models,
    userId,
    projectId,
  }: SurveyResponsesQueryFunctionContext): Promise<DatatrakWebSurveyResponsesRequest.ResBody> => {
    const surveyResponses = await models.database.find(
      models.surveyResponse.databaseRecord,
      {
        ['survey.project_id']: projectId,
        user_id: userId,
        // Survey response records in database already filtered by user’s access policy
      },
      {
        columns: [
          { id: 'survey_response.id' },
          'data_time',
          { survey_name: 'survey.name' },
          { entity_name: 'entity.name' },
          { country_name: 'country.name' },
        ],
        multiJoin: [
          {
            joinWith: models.survey.databaseRecord,
            joinCondition: ['survey_response.survey_id', 'survey.id'],
          },
          {
            joinWith: models.entity.databaseRecord,
            joinCondition: ['survey_response.entity_id', 'entity.id'],
          },
          {
            joinWith: models.country.databaseRecord,
            joinCondition: ['entity.country_code', 'country.code'],
          },
        ],
        sort: ['data_time DESC'],
      },
    );

    return camelcaseKeys(surveyResponses, {
      deep: true,
    }) as unknown as DatatrakWebSurveyResponsesRequest.ResBody;
  },
  remote: async ({
    userId,
    projectId,
  }: SurveyResponsesQueryFunctionContext): Promise<DatatrakWebSurveyResponsesRequest.ResBody> => {
    return await get('surveyResponses', {
      params: { userId, projectId },
    });
  },
} as const;

export const useSurveyResponses = (userId?: UserAccount['id'], projectId?: Project['id']) => {
  const params = { userId, projectId };

  return useDatabaseQuery<DatatrakWebSurveyResponsesRequest.ResBody>(
    ['surveyResponses', params],
    useIsOfflineFirst() ? queryFunctions.local : queryFunctions.remote,
    {
      enabled: Boolean(userId && projectId),
      localContext: params,
    },
  );
};

export const useCurrentUserSurveyResponses = () => {
  const user = useCurrentUserContext();
  return useSurveyResponses(user.id, user.projectId);
};
