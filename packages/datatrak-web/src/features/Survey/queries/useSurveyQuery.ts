import { UseQueryOptions } from '@tanstack/react-query';

import { ProjectRecord } from '@tupaia/database';
import { SurveyRecord } from '@tupaia/tsmodels';
import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import { Country, DatatrakWebSurveyRequest, Survey } from '@tupaia/types';
import { get, useDatabaseQuery } from '../../../api';
import { useIsOfflineFirst } from '../../../api/offlineFirst';
import { DatatrakWebModelRegistry } from '../../../types';
import { getSurveyCountryCodes, getSurveyCountryNames } from './util';

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
        countryCodes?: Country['code'][];
        countryNames?: Country['name'][];
        project?: ProjectRecord;
        screens?: unknown; // TODO
      } = await trxModels.survey.findOne({ code: ensure(surveyCode) });

      const [countryNames, countryCodes, screens, project] = await Promise.all([
        getSurveyCountryNames(trxModels, [survey.id]),
        getSurveyCountryCodes(trxModels, [survey.id]),
        survey.getPaginatedQuestions(),
        survey.getProject(),
      ]);
      survey.countryNames = countryNames[survey.id];
      survey.countryCodes = countryCodes[survey.id];
      survey.screens = screens;
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
