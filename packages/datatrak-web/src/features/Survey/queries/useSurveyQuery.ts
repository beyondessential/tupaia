import { UseQueryOptions } from '@tanstack/react-query';

import { ProjectRecord } from '@tupaia/database';
import { SurveyRecord } from '@tupaia/tsmodels';
import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import { Country, DatatrakWebSurveyRequest, Survey } from '@tupaia/types';
import { get, useDatabaseQuery } from '../../../api';
import { useIsOfflineFirst } from '../../../api/offlineFirst';
import { ContextualQueryFunctionContext } from '../../../api/queries/useDatabaseQuery';
import { getSurveyCountryCodes, getSurveyCountryNames } from './util';

interface SurveyQueryFunctionContext extends ContextualQueryFunctionContext {
  surveyCode?: Survey['code'];
}

const surveyQueryFunctions = {
  remote: async ({ surveyCode }: SurveyQueryFunctionContext) =>
    await get(`surveys/${encodeURIComponent(ensure(surveyCode))}`),
  local: async ({ models, surveyCode }: SurveyQueryFunctionContext) =>
    await models.wrapInReadOnlyTransaction(async transactingModels => {
      const survey: SurveyRecord & {
        countryCodes?: Country['code'][];
        countryNames?: Country['name'][];
        project?: ProjectRecord;
        screens?: unknown; // TODO
      } = await transactingModels.survey.findOne({ code: ensure(surveyCode) });

      const [countryNames, countryCodes, screens, project] = await Promise.all([
        getSurveyCountryNames(transactingModels, [survey.id]),
        getSurveyCountryCodes(transactingModels, [survey.id]),
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

  return useDatabaseQuery(
    ['survey', surveyCode],
    isOfflineFirst ? surveyQueryFunctions.local : surveyQueryFunctions.remote,
    {
      ...useQueryOptions,
      enabled: Boolean(surveyCode) && (useQueryOptions?.enabled ?? true),
      localContext: { surveyCode },
      meta: { applyCustomErrorHandling: true },
    },
  );
}
