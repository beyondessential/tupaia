import { Country, DatatrakWebUsersRequest } from '@tupaia/types';

import { get } from '../api';
import { Survey } from '../../types';
import { useIsLocalFirst } from '../localFirst';
import { getSurveyUsers } from '../../database';
import { useDatabaseQuery } from './useDatabaseQuery';

const getOnlineSurveyUsers = async ({
  surveyCode,
  countryCode,
  searchTerm,
}: {
  surveyCode?: Survey['code'];
  countryCode?: Country['code'];
  searchTerm?: string;
}) => {
  return await get(`users/${surveyCode}/${countryCode}`, {
    params: {
      searchTerm,
    },
  }) as DatatrakWebUsersRequest.ResBody;
};

export const useSurveyUsers = (
  surveyCode?: Survey['code'],
  countryCode?: Country['code'],
  searchTerm?: string,
) => {
  const isOfflineFirst = useIsLocalFirst();

  return useDatabaseQuery<DatatrakWebUsersRequest.ResBody>(
    ['surveyUsers', surveyCode, countryCode, searchTerm],
    isOfflineFirst ? getSurveyUsers : getOnlineSurveyUsers,
    {
      enabled: !!surveyCode && !!countryCode,
      localContext: {
        surveyCode,
        countryCode,
        searchTerm,
      },
    },
  );
};
