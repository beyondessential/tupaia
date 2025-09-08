import { UseQueryOptions } from '@tanstack/react-query';

import { camelcaseKeys } from '@tupaia/tsutils';
import { DatatrakWebSurveyRequest, Survey } from '@tupaia/types';
import { get, useDatabaseQuery } from '../../../api';
import { useIsOfflineFirst } from '../../../api/offlineFirst';
import { DatatrakWebModelRegistry } from '../../../types';
import { getSurveyCountryCodes, getSurveyCountryNames, getSurveyQuestionsValues } from './util';

interface UseSurveyQueryFunctionContext {
  surveyCode: Survey['code'];
}

const surveyQueryFunctions = {
  remote: async ({ surveyCode }: UseSurveyQueryFunctionContext) =>
    await get(`surveys/${encodeURIComponent(surveyCode)}`),
  local: async ({
    models,
    surveyCode,
  }: UseSurveyQueryFunctionContext & { models: DatatrakWebModelRegistry }) =>
    models.wrapInReadOnlyTransaction(async trxModels => {
      const survey = await trxModels.survey.findOne({ code: surveyCode });
      const [surveyQuestionsValues, countryNames, countryCodes] = await Promise.all([
        getSurveyQuestionsValues(trxModels, [survey.id]),
        getSurveyCountryNames(trxModels, [survey.id]),
        getSurveyCountryCodes(trxModels, [survey.id]),
      ]);
      survey.surveyQuestions = surveyQuestionsValues[survey.id];
      survey.countryNames = countryNames[survey.id];
      survey.countryCodes = countryCodes[survey.id];

      survey.model = undefined;
      const rv = camelcaseKeys(survey, { deep: true });
      console.log('local', rv);
      return rv;
    }),
};

export function useSurveyQuery(
  surveyCode?: Survey['code'],
  useQueryOptions?: UseQueryOptions<DatatrakWebSurveyRequest.ResBody>,
) {
  const isOfflineFirst = useIsOfflineFirst();

  const options = Object.assign(
    {
      enabled: Boolean(surveyCode),
      localContext: { surveyCode },
      meta: { applyCustomErrorHandling: true },
    },
    useQueryOptions,
  );

  return useDatabaseQuery(
    ['survey', surveyCode],
    isOfflineFirst ? surveyQueryFunctions.local : surveyQueryFunctions.remote,
    options,
  );
}
