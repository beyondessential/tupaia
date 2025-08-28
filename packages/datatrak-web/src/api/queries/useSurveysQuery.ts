import { UseQueryOptions } from '@tanstack/react-query';

import { DbFilter } from '@tupaia/tsmodels';
import { camelcaseKeys } from '@tupaia/tsutils';
import { Country, DatatrakWebSurveyRequest, Project, Survey, SurveyGroup } from '@tupaia/types';

import { DatatrakWebModelRegistry, Entity } from '../../types';
import { isNotNullish, isNullish } from '../../utils';
import { get, RequestParameters } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery } from './useDatabaseQuery';

interface UseSurveysQueryFilterParams {
  countryCode?: Entity['code'];
  projectId?: Project['id'];
  searchTerm?: string;
}

interface UseSurveysQueryJoinParams {
  includeCountryNames?: boolean;
  includeSurveyGroupNames?: boolean;
}

type UseSurveysQueryParams = UseSurveysQueryFilterParams & UseSurveysQueryJoinParams;

const getRemote = async ({
  countryCode,
  includeCountryNames,
  includeSurveyGroupNames,
  projectId,
  searchTerm,
}: {
  countryCode?: Entity['code'];
  includeCountryNames?: boolean;
  includeSurveyGroupNames?: boolean;
  projectId?: Project['id'];
  searchTerm?: string;
}) => {
  const params: RequestParameters = { fields: ['name', 'code', 'id'] };
  if (countryCode) params.countryCode = countryCode;
  if (includeCountryNames) params.fields.push('countryNames');
  if (includeSurveyGroupNames) params.fields.push('survey_group.name');
  if (projectId) params.projectId = projectId;
  if (searchTerm) params.searchTerm = searchTerm;
  return await get('surveys', { params });
};

const getLocal = async ({
  models,
  countryCode,
  includeCountryNames,
  includeSurveyGroupNames,
  projectId,
  searchTerm,
}: {
  models: DatatrakWebModelRegistry;
  countryCode?: Entity['code'];
  includeCountryNames?: boolean;
  includeSurveyGroupNames?: boolean;
  projectId?: Project['id'];
  searchTerm?: string;
}) => {
  const where = constructDbFilter({ projectId, searchTerm, countryCode });
  const records = await models.survey.find(where);

  if (records.length === 0) return [];

  let surveys = records.map(({ code, id, name, survey_group_id }) => ({
    code,
    id,
    name,
    survey_group_id,
  }));

  // Add country names
  if (includeCountryNames) {
    const surveyIds = surveys.map(s => s.id);
    const countryNamesBySurveyId = await getSurveyCountryNames(models, surveyIds);
    surveys = surveys.map(s => ({ ...s, countryNames: countryNamesBySurveyId[s.id] }));
  }

  // Add survey group names
  if (includeSurveyGroupNames) {
    const surveyGroupIds = surveys.map(s => s.survey_group_id).filter(isNotNullish);
    const surveyGroups = await models.surveyGroup.find({ id: surveyGroupIds });
    const surveyGroupNamesById = surveyGroups.reduce<
      Record<SurveyGroup['id'], SurveyGroup['name']>
    >((dict, surveyGroup) => {
      dict[surveyGroup.id] = surveyGroup.name;
      return dict;
    }, {});

    surveys = surveys.map(s => ({
      ...s,
      surveyGroupName: isNullish(s.survey_group_id)
        ? null
        : surveyGroupNamesById[s.survey_group_id],
    }));
  }

  return camelcaseKeys(
    surveys.map(({ survey_group_id: _, ...rest }) => rest), // Omit survey_group_id from result
    { deep: true },
  );
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

  return useDatabaseQuery<DatatrakWebSurveyRequest.ResBody[]>(
    [
      'surveys',
      projectId,
      countryCode,
      searchTerm,
      includeCountryNames,
      includeSurveyGroupNames,
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

/** @privateRemarks Logic duplicated from `@tupaia/central-server/apiV2/surveys/GETSurveys` */
async function getSurveyCountryNames(
  models: DatatrakWebModelRegistry,
  surveyIds: Survey['id'][],
): Promise<Record<Survey['id'], Country['name'][]>> {
  if (surveyIds.length === 0) return {};

  const rows: { survey_id: Survey['id']; country_names: Country['name'][] }[] =
    await models.database.executeSql(
      `
        SELECT
          survey.id survey_id,
          ARRAY_AGG(country.name ORDER BY country.name) country_names
        FROM
          survey
          LEFT JOIN country ON (country.id = ANY (survey.country_ids))
        WHERE
          survey.id IN (${surveyIds.map(() => '?') /* TODO: SqlQuery.record(surveyIds) */}) GROUP BY survey.id;
      `,
      surveyIds,
    );

  return Object.fromEntries(rows.map(row => [row.survey_id, row.country_names]));
}
