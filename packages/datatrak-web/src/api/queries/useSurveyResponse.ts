import { UseQueryOptions } from '@tanstack/react-query';

import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import { DatatrakWebSingleSurveyResponseRequest, QuestionType } from '@tupaia/types';
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

    const answers: DatatrakWebSingleSurveyResponseRequest.ResBody['answers'] = {};
    for (const { question_id: questionId, type, text } of answerList) {
      if (!text) continue;
      if (type === QuestionType.User) {
        const user = await models.user.findById(text, { columns: ['id', 'full_name'] });
        if (!user) {
          // Log the error but continue to the next answer. This is in case the user was deleted
          console.error(`User with id ${text} not found`);
          continue;
        }
        answers[questionId] = { id: user.id, name: user.full_name };
        continue;
      }
      answers[questionId] = text;
    }

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
