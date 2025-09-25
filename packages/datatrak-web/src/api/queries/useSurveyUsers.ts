import { Country, DatatrakWebUsersRequest } from '@tupaia/types';

import { getSurveyUsers } from '../../database';
import { Survey } from '../../types';
import { get } from '../api';
import { useIsOfflineFirst } from '../offlineFirst';
import { useDatabaseQuery } from './useDatabaseQuery';

const getOnlineSurveyUsers = async ({
  surveyCode,
  countryCode,
  searchTerm,
}: {
  surveyCode?: Survey['code'];
  countryCode?: Country['code'];
  searchTerm?: string;
}): Promise<DatatrakWebUsersRequest.ResBody> => {
  return await get(`users/${surveyCode}/${countryCode}`, {
    params: { searchTerm },
  });
};

export const useSurveyUsers = (
  surveyCode?: Survey['code'],
  countryCode?: Country['code'],
  searchTerm?: string,
) => {
  const isOfflineFirst = useIsOfflineFirst();

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
