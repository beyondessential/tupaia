/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { TupaiaWebEntityRequest } from '@tupaia/types';
import { useCurrentUser } from '../CurrentUserContext';
import { get } from '../api';
import { useParams } from 'react-router-dom';

export const useCountry = () => {
  const { countryCode } = useParams();
  const user = useCurrentUser();
  const projectCode = user.project?.code;

  return useQuery(
    ['entity', projectCode, countryCode],
    (): Promise<TupaiaWebEntityRequest.ResBody> => get(`entity/${projectCode}/${countryCode}`),
    { enabled: !!projectCode && !!countryCode },
  );
};
