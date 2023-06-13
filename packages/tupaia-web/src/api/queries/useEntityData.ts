/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useEntityData = (projectCode: string, entityCode: string) => {
  return useQuery(
    ['project', projectCode, entityCode],
    () =>
      get(
        `organisationUnit?includeCountryData=${
          projectCode !== entityCode
        }&organisationUnitCode=${entityCode}&projectCode=${projectCode}`,
      ),
    {
      enabled: !!projectCode && !!entityCode,
      placeholderData: {
        organisationUnitChildren: [],
      },
    },
  );
};
