import type { UseQueryOptions } from '@tanstack/react-query';

import type { AccessPolicy } from '@tupaia/access-policy';
import { assertAnyPermissions, assertBESAdminAccess } from '@tupaia/access-policy';
import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import type { Country, DatatrakWebSurveyRequest, Project, Survey } from '@tupaia/types';
import { get, useDatabaseQuery } from '../../../api';
import { useIsOfflineFirst } from '../../../api/offlineFirst';
import type { ContextualQueryFunctionContext } from '../../../api/queries/useDatabaseQuery';
import { getSurveyCountryCodes, getSurveyCountryNames } from './util';

interface SurveyQueryFunctionContext extends ContextualQueryFunctionContext {
  surveyCode?: Survey['code'];
}

const surveyQueryFunctions = {
  remote: async ({ surveyCode }: SurveyQueryFunctionContext) =>
    await get(`surveys/${encodeURIComponent(ensure(surveyCode))}`),
  local: async ({ accessPolicy, models, surveyCode }: SurveyQueryFunctionContext) =>
    await models.wrapInReadOnlyTransaction(async transactingModels => {
      const surveyRecord = await transactingModels.survey.findOne({
        code: ensure(surveyCode),
      });

      const surveyChecker = async (accessPolicy: AccessPolicy) =>
        await transactingModels.survey.assertCanRead(accessPolicy, surveyRecord.id);
      const permissionChecker = assertAnyPermissions([assertBESAdminAccess, surveyChecker]);
      await permissionChecker(accessPolicy);

      const survey: Survey & {
        countryCodes?: Country['code'][];
        countryNames?: Country['name'][];
        project?: Project;
        screens?: unknown; // TODO
      } = (await surveyRecord.getData()) as Survey;

      const [countryNames, countryCodes, screens, project] = await Promise.all([
        getSurveyCountryNames(transactingModels, [survey.id]),
        getSurveyCountryCodes(transactingModels, [survey.id]),
        surveyRecord.getPaginatedQuestions(),
        (await surveyRecord.getProject()).getData() as Promise<Project>,
      ]);
      survey.countryNames = countryNames[survey.id];
      survey.countryCodes = countryCodes[survey.id];
      survey.screens = screens;
      survey.project = project;

      return camelcaseKeys(survey, {
        deep: true,
        // Don’t touch JSONB attributes
        stopPaths: [
          'screens.survey_screen_components.config',
          'screens.survey_screen_components.validation_criteria',
          'screens.survey_screen_components.visibility_criteria',
        ],
      });
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
