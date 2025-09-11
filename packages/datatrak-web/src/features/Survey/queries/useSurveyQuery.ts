import { UseQueryOptions } from '@tanstack/react-query';

import { ProjectRecord } from '@tupaia/database';
import { SurveyRecord } from '@tupaia/tsmodels';
import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import { Country, DatatrakWebSurveyRequest, Survey } from '@tupaia/types';
import { get, useDatabaseQuery } from '../../../api';
import { useIsOfflineFirst } from '../../../api/offlineFirst';
import { DatatrakWebModelRegistry } from '../../../types';
import { getSurveyCountryCodes, getSurveyCountryNames, getSurveyQuestionsValues } from './util';

interface UseSurveyQueryFunctionContext {
  surveyCode?: Survey['code'];
}

const surveyQueryFunctions = {
  remote: async ({ surveyCode }: UseSurveyQueryFunctionContext) =>
    await get(`surveys/${encodeURIComponent(ensure(surveyCode))}`),
  local: async ({
    models,
    surveyCode,
  }: UseSurveyQueryFunctionContext & { models: DatatrakWebModelRegistry }) =>
    await models.wrapInReadOnlyTransaction(async trxModels => {
      const survey: SurveyRecord & {
        surveyQuestions?: unknown[];
        countryNames?: Country['name'][];
        countryCodes?: Country['code'][];
        project?: ProjectRecord;
      } = await trxModels.survey.findOne({ code: ensure(surveyCode) });

      const [surveyQuestionsValues, countryNames, countryCodes, project] = await Promise.all([
        getSurveyQuestionsValues(trxModels, [survey.id]),
        getSurveyCountryNames(trxModels, [survey.id]),
        getSurveyCountryCodes(trxModels, [survey.id]),
        survey.getProject(),
      ]);
      survey.surveyQuestions = surveyQuestionsValues[survey.id];
      survey.countryNames = countryNames[survey.id];
      survey.countryCodes = countryCodes[survey.id];
      survey.project = project;

      survey.model = undefined;
      survey.project.model = undefined;

      return camelcaseKeys(survey, { deep: true });
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
