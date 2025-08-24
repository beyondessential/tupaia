import { useQuery } from '@tanstack/react-query';
import { DatatrakWebSurveyRequest } from '@tupaia/types';
import { get } from '../api';
import { useIsLocalFirst } from '../localFirst';
import { useDatabase } from '../../hooks/database';

export const useSurveysQuery = () => {
  const isOfflineFirst = useIsLocalFirst();
  const { models } = useDatabase();

  const getRemote = async () =>
    get('surveys', {
      params: {
        fields: ['name', 'code', 'id', 'survey_group.name', 'countryNames'],
      },
    });
  const getLocal = async () => {
    const surveys = await models.survey.all();
    return surveys;
  };

  return useQuery<DatatrakWebSurveyRequest.ResBody[]>(
    ['surveys'],
    isOfflineFirst ? getLocal : getRemote,
  );
};
