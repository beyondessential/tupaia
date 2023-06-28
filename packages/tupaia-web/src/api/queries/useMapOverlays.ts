/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { EntityCode, ProjectCode } from '../../types';

export const useMapOverlays = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  return useQuery(
    ['mapOverlays', projectCode, entityCode],
    async () => {
      // shouldShowAllParentCountryResults should be false if the current country code is the same
      // as the project code. This will really only ever happen if the entityCode and the projectCode
      // are the same
      return get(`mapOverlays/${projectCode}/${entityCode}`, {
        params: {},
      });
    },
    {
      enabled: !!projectCode && !!entityCode,
    },
  );
};
