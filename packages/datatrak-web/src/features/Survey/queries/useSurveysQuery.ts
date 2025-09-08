import { UseQueryOptions } from '@tanstack/react-query';

import { DbFilter } from '@tupaia/tsmodels';
import { camelcaseKeys } from '@tupaia/tsutils';
import { Country, DatatrakWebSurveyRequest, Project, Survey, SurveyGroup } from '@tupaia/types';
import { get, RequestParameters, useDatabaseQuery } from '../../../api';
import { useIsOfflineFirst } from '../../../api/offlineFirst';
import { DatatrakWebModelRegistry, Entity } from '../../../types';
import {
  getSurveyCountryCodes,
  getSurveyCountryNames,
  getSurveyGroupNames,
  getSurveyQuestionsValues,
} from './util';

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

const getRemote = async ({
  countryCode,
  includeCountryNames,
  includeSurveyGroupNames,
  includeQuestions,
  projectId,
  searchTerm,
}: {
  countryCode?: Entity['code'];
  includeCountryNames?: boolean;
  includeSurveyGroupNames?: boolean;
  includeQuestions?: boolean;
  projectId?: Project['id'];
  searchTerm?: string;
}): Promise<DatatrakWebSurveyRequest.ResBody[]> => {
  const params: RequestParameters = { fields: ['name', 'code', 'id'] };

  if (countryCode) params.countryCode = countryCode;
  if (projectId) params.projectId = projectId;
  if (searchTerm) params.searchTerm = searchTerm;

  if (includeCountryNames) params.fields.push('countryNames');
  if (includeSurveyGroupNames) params.fields.push('survey_group.name');
  if (includeQuestions) params.fields.push('surveyQuestions');

  return await get('surveys', { params });
};

const getLocal = async ({
  models,
  countryCode,
  includeCountryNames,
  includeSurveyGroupNames,
  includeQuestions,
  projectId,
  searchTerm,
}: {
  models: DatatrakWebModelRegistry;
  countryCode?: Entity['code'];
  includeCountryNames?: boolean;
  includeSurveyGroupNames?: boolean;
  includeQuestions?: boolean;
  projectId?: Project['id'];
  searchTerm?: string;
}) => {
  const where = constructDbFilter({ projectId, searchTerm, countryCode });

  const trxModels = models; // TODO: Replace with read-only transaction
  const records = await trxModels.survey.find(where);

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
  const [surveyQuestionsValues, countryNames, countryCodes, surveyGroupNames] = await Promise.all([
    getSurveyQuestionsValues(trxModels, surveyIds, { enabled: includeQuestions }),
    getSurveyCountryNames(trxModels, surveyIds, { enabled: includeCountryNames }),
    getSurveyCountryCodes(trxModels, surveyIds, { enabled: includeSurveyGroupNames }),
    getSurveyGroupNames(trxModels, surveyIds, { enabled: includeSurveyGroupNames }),
  ]);

  for (const survey of surveys) {
    survey.surveyQuestions = surveyQuestionsValues[survey.id];
    survey.countryNames = countryNames[survey.id];
    survey.countryCodes = countryCodes[survey.id];
    survey.surveyGroupName = surveyGroupNames[survey.id];

    // Done with survey group ID now. Omit it from result.
    survey.survey_group_id = undefined;
  }

  return camelcaseKeys(surveys, { deep: true });
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

function constructDbFilter({
  projectId,
  searchTerm,
  countryCode,
}: UseSurveysQueryFilterParams): DbFilter<Survey> {
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
    // TODO: Replace with QUERY_CONJUNCTIONS.RAW once @tupaia/database imports are fixed
    dbFilter._raw_ = {
      sql: '(SELECT id FROM country WHERE code = ? LIMIT 1) = ANY(country_ids)',
      parameters: [countryCode],
    };
  }

  return dbFilter;
}
