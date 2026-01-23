import { UseQueryOptions } from '@tanstack/react-query';

import { AccessPolicy } from '@tupaia/access-policy';
import { DbFilter, QueryConjunctions } from '@tupaia/tsmodels';
import { camelcaseKeys } from '@tupaia/tsutils';
import { Country, DatatrakWebSurveyRequest, Project, Survey, SurveyGroup } from '@tupaia/types';
import { RequestParameters, get, useDatabaseQuery } from '../../../api';
import { useIsOfflineFirst } from '../../../api/offlineFirst';
import { ContextualQueryFunctionContext } from '../../../api/queries/useDatabaseQuery';
import { DatatrakWebModelRegistry, Entity } from '../../../types';
import { getSurveyCountryCodes, getSurveyCountryNames, getSurveyGroupNames } from './util';

interface UseSurveysQueryFilterParams {
  countryCode?: Entity['code'];
  projectId?: Project['id'];
  searchTerm?: string;
}

interface UseSurveysQueryJoinParams {
  includeCountryNames?: boolean;
  includeSurveyGroupNames?: boolean;
}

interface UseSurveysQueryParams extends UseSurveysQueryFilterParams, UseSurveysQueryJoinParams {}

interface SurveysQueryFunctionContext
  extends UseSurveysQueryParams,
    ContextualQueryFunctionContext {}

const getRemote = async ({
  countryCode,
  includeCountryNames,
  includeSurveyGroupNames,
  projectId,
  searchTerm,
}: SurveysQueryFunctionContext): Promise<DatatrakWebSurveyRequest.ResBody[]> => {
  const params: {
    countryCode?: Country['code'];
    fields: string[];
    projectId?: Project['id'];
    searchTerm?: string;
  } = { fields: ['name', 'code', 'id'] } satisfies RequestParameters;

  if (countryCode) params.countryCode = countryCode;
  if (projectId) params.projectId = projectId;
  if (searchTerm) params.searchTerm = searchTerm;

  if (includeCountryNames) params.fields.push('countryNames');
  if (includeSurveyGroupNames) params.fields.push('survey_group.name');

  return await get('surveys', { params });
};

const getLocal = async ({
  models,
  accessPolicy,
  countryCode,
  includeCountryNames,
  includeSurveyGroupNames,
  projectId,
  searchTerm,
}: SurveysQueryFunctionContext) => {
  const where = await constructDbFilter({
    models,
    accessPolicy,
    projectId,
    searchTerm,
    countryCode,
  });

  return await models.wrapInReadOnlyTransaction(async transactingModels => {
    const records = await transactingModels.survey.find(where);

    if (records.length === 0) return [];

    const surveys: (Pick<Survey, 'code' | 'id' | 'name' | 'survey_group_id'> & {
      countryNames?: Country['name'][];
      countryCodes?: Country['code'][];
      surveyGroupName?: SurveyGroup['name'] | null;
      surveyQuestions?: unknown[];
    })[] = records.map(({ code, id, name, survey_group_id }) => ({
      code,
      id,
      name,
      survey_group_id,
    }));

    const surveyIds = surveys.map(s => s.id);
    const [countryNames, countryCodes, surveyGroupNames] = await Promise.all([
      getSurveyCountryNames(transactingModels, surveyIds, { enabled: includeCountryNames }),
      getSurveyCountryCodes(transactingModels, surveyIds),
      getSurveyGroupNames(transactingModels, surveyIds, { enabled: includeSurveyGroupNames }),
    ]);

    for (const survey of surveys) {
      survey.countryNames = countryNames[survey.id];
      survey.countryCodes = countryCodes[survey.id];
      survey.surveyGroupName = surveyGroupNames[survey.id];

      // Done with survey group ID now. Omit it from result.
      survey.survey_group_id = undefined;
    }

    return camelcaseKeys(surveys, { deep: true });
  });
};

export function useSurveysQuery(
  {
    countryCode,
    projectId,
    searchTerm,
    includeCountryNames = true,
    includeSurveyGroupNames = true,
  }: UseSurveysQueryParams = {},
  useQueryOptions?: UseQueryOptions<DatatrakWebSurveyRequest.ResBody[]>,
) {
  const isOfflineFirst = useIsOfflineFirst();

  return useDatabaseQuery(
    [
      'surveys',
      { countryCode, projectId, searchTerm },
      { includeCountryNames, includeSurveyGroupNames },
      isOfflineFirst,
    ],
    isOfflineFirst ? getLocal : getRemote,
    {
      ...useQueryOptions,
      localContext: {
        countryCode,
        projectId,
        searchTerm,
        includeCountryNames,
        includeSurveyGroupNames,
      },
    },
  );
}

async function constructDbFilter({
  models,
  accessPolicy,
  projectId,
  searchTerm,
  countryCode,
}: {
  models: DatatrakWebModelRegistry;
  accessPolicy: AccessPolicy;
  projectId?: Project['id'];
  searchTerm?: string;
  countryCode?: Entity['code'];
}): Promise<DbFilter<Survey>> {
  const dbFilter: DbFilter<Survey> = {};

  if (projectId) {
    dbFilter.project_id = projectId;
  }
  if (searchTerm) {
    dbFilter.name = {
      comparator: 'ilike',
      comparisonValue: `%${searchTerm}%`,
    };
  }
  if (countryCode) {
    dbFilter[QueryConjunctions.RAW] = {
      sql: '(SELECT id FROM country WHERE code = ?) = ANY (country_ids)',
      parameters: [countryCode],
    };
  }

  return await models.survey.createRecordsPermissionFilter(accessPolicy, dbFilter);
}
