/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { WebServerEntityRequest } from '@tupaia/types';
import { get } from '../api';

export const useCountry = (projectCode, countryCode) => {
  return useQuery(
    ['entity', projectCode, countryCode],
    (): Promise<WebServerEntityRequest.ResBody> => get(`entity/${projectCode}/${countryCode}`),
    { enabled: !!projectCode && !!countryCode },
  );
};
