import { useQuery } from '@tanstack/react-query';

import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { DbFilter } from '@tupaia/tsmodels';
import { camelcaseKeys } from '@tupaia/tsutils';
import { DatatrakWebSurveyRequest, Project, Survey, SurveyGroup } from '@tupaia/types';

import { useDatabase } from '../../hooks/database';
import { Entity } from '../../types';
import { get } from '../api';
import { useIsLocalFirst } from '../localFirst';

interface QueryOptions {
  countryCode?: Entity['code'];
  searchTerm?: string;
}

export const useProjectSurveys = (
  projectId?: Project['id'],
  { countryCode, searchTerm }: QueryOptions = {},
) => {
  const isOfflineFirst = useIsLocalFirst();
  const { models } = useDatabase();

  const getRemote = async () =>
    await get('surveys', {
      params: {
        fields: ['name', 'code', 'id', 'survey_group.name'],
        projectId,
        ...(searchTerm && { searchTerm }),
        ...(countryCode && { countryCode }),
      },
    });
  const getLocal = async () => {
    const constructDbConditions = () => {
      const dbConditions: DbFilter<Survey> = {};
      if (projectId) {
        dbConditions.project_id = projectId;
      }
      if (searchTerm) {
        dbConditions.name = {
          comparator: 'ilike',
          comparisonValue: `%${searchTerm}%`,
        };
      }
      if (countryCode) {
        dbConditions[QUERY_CONJUNCTIONS.RAW] = {
          sql: '(SELECT id FROM country WHERE code = ? LIMIT 1) = ANY(country_ids)',
          parameters: [countryCode],
        };
      }
      return dbConditions;
    };

    const where = constructDbConditions();
    const surveys = (await models.survey.find(where)).map(({ model: _, ...rest }) => rest);

    if (surveys.length === 0) return [];

    const surveyGroupIds = surveys.map(s => s.survey_group_id);
    const surveyGroups = await models.surveyGroup.find({ id: surveyGroupIds });
    const surveyGroupNamesById = surveyGroups.reduce(
      (dict, surveyGroup) => {
        dict[surveyGroup.id] = surveyGroup.name;
        return dict;
      },
      {} as Record<SurveyGroup['id'], SurveyGroup['name']>,
    );

    const surveyJoinGroupName = surveys.map(s =>
      !s.survey_group_id ? s : { ...s, surveyGroupName: surveyGroupNamesById[s.survey_group_id] },
    );

    return camelcaseKeys(surveyJoinGroupName, { deep: true });
  };

  return useQuery<DatatrakWebSurveyRequest.ResBody[]>(
    ['surveys', projectId, countryCode, searchTerm, isOfflineFirst],
    isOfflineFirst ? getLocal : getRemote,
    { enabled: !!projectId },
  );
};
