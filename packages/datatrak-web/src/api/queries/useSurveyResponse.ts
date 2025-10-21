import { UseQueryOptions } from '@tanstack/react-query';

import { SurveyResponseModel } from '@tupaia/database';
import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '../CurrentUserContext';
import { useIsOfflineFirst } from '../offlineFirst';
import { ContextualQueryFunctionContext, useDatabaseQuery } from './useDatabaseQuery';

interface SurveyResponseQueryFunctionContext extends ContextualQueryFunctionContext {
  requesterId?: string | undefined;
  surveyResponseId?: string | null;
}

const getRemote = async ({ surveyResponseId }: SurveyResponseQueryFunctionContext) => {
  if (!surveyResponseId) return null;
  return await get(`surveyResponse/${encodeURIComponent(surveyResponseId)}`);
};

const getLocal = async ({
  models,
  requesterId,
  surveyResponseId,
}: SurveyResponseQueryFunctionContext) => {
  if (!requesterId || !surveyResponseId) return null;

  return await models.wrapInReadOnlyTransaction(async transactingModels => {
    const surveyResponse = ensure(
      await transactingModels.surveyResponse.findById(surveyResponseId),
      `No survey response exists with ID ${surveyResponseId}`,
    );

    const [entityParentName, countryCode, answerList] = await Promise.all([
      surveyResponse.getEntityParentName(),
      surveyResponse.getCountryCode(),
      transactingModels.answer.find(
        { survey_response_id: surveyResponseId },
        { columns: ['text', 'question_id', 'type'] },
      ),
    ]);

    const answers = await SurveyResponseModel.formatAnswersForClient(transactingModels, answerList);

    return camelcaseKeys({
      ...surveyResponse,
      countryCode,
      entityParentName,
      answers,
    });
  });
};

export const useSurveyResponse = (
  surveyResponseId?: string | null,
  useQueryOptions?: UseQueryOptions<DatatrakWebSingleSurveyResponseRequest.ResBody>,
) => {
  const isOfflineFirst = useIsOfflineFirst();
  const requesterId = useCurrentUserContext().id;

  return useDatabaseQuery<DatatrakWebSingleSurveyResponseRequest.ResBody>(
    ['surveyResponse', surveyResponseId],
    isOfflineFirst ? getLocal : getRemote,
    {
      ...useQueryOptions,
      enabled: Boolean(surveyResponseId) && (useQueryOptions?.enabled ?? true),
      localContext: { requesterId, surveyResponseId },
    },
  );
};
