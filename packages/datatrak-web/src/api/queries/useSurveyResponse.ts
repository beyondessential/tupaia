import { UseQueryOptions } from '@tanstack/react-query';

import { processColumns, RECORDS, SurveyResponseModel } from '@tupaia/database';
import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import { DatatrakWebSingleSurveyResponseRequest } from '@tupaia/types';
import { get } from '../api';
import { useCurrentUserContext } from '../CurrentUserContext';
import { useIsOfflineFirst } from '../offlineFirst';
import { ContextualQueryFunctionContext, useDatabaseQuery } from './useDatabaseQuery';
import { SURVEY_RESPONSE_DEFAULT_FIELDS } from '@tupaia/constants';

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
      await transactingModels.database.findOne(
        RECORDS.SURVEY_RESPONSE,
        { [`${RECORDS.SURVEY_RESPONSE}.id`]: surveyResponseId },
        {
          columns: processColumns(models, SURVEY_RESPONSE_DEFAULT_FIELDS, RECORDS.SURVEY_RESPONSE),
          multiJoin: [
            {
              joinWith: RECORDS.SURVEY,
              joinCondition: [`${RECORDS.SURVEY}.id`, `${RECORDS.SURVEY_RESPONSE}.survey_id`],
            },
            {
              joinWith: RECORDS.ENTITY,
              joinCondition: [`${RECORDS.ENTITY}.id`, `${RECORDS.SURVEY_RESPONSE}.entity_id`],
            },
            {
              joinWith: RECORDS.COUNTRY,
              joinCondition: [`${RECORDS.COUNTRY}.code`, `${RECORDS.ENTITY}.country_code`],
            },
          ],
        },
      ),
      `No survey response exists with ID ${surveyResponseId}`,
    );

    const projectId = surveyResponse['survey.project_id'];
    const entityId = surveyResponse['entity.id'];
    const entityParentName = await transactingModels.entity.getParentEntityName(projectId, entityId);
    const countryCode = await surveyResponse['country.code'];
    const answerList = await transactingModels.answer.find(
      { survey_response_id: surveyResponseId },
      { columns: ['text', 'question_id', 'type'] },
    );


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
