/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { EntityCode, ProjectCode } from '../../types';
import { MapOverlay } from '@tupaia/types';

export const useMapOverlayData = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  mapOverlayCode?: MapOverlay['code'] | null,
) => {
  return useQuery(
    ['mapOverlayData', projectCode, entityCode, mapOverlayCode],
    async () => {
      // shouldShowAllParentCountryResults should be false if the current country code is the same as the project code. This will really only ever happen if the entityCode and the projectCode are the same
      return get(
        `measureData?mapOverlayCode=${mapOverlayCode}&organisationUnitCode=${entityCode}&projectCode=${projectCode}&shouldShowAllParentCountryResults=${
          projectCode !== entityCode
        }`,
      );
    },
    {
      enabled: !!projectCode && !!entityCode && !!mapOverlayCode,
    },
  );
};
