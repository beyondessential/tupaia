/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { EntityCode, ProjectCode } from '../../types';
import { MapOverlay } from '@tupaia/types';

// Todo: include new reports in this query and rename to useMapOverlayReport
export const useLegacyMapOverlay = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  mapOverlayCode?: MapOverlay['code'] | null,
) => {
  return useQuery(
    ['legacyMapOverlayReport', projectCode, entityCode, mapOverlayCode],
    async () => {
      // shouldShowAllParentCountryResults should be false if the current country code is the same as the project code. This will really only ever happen if the entityCode and the projectCode are the same
      return get(
        `legacyMapOverlayReport?mapOverlayCode=${mapOverlayCode}&organisationUnitCode=${entityCode}&projectCode=${projectCode}&shouldShowAllParentCountryResults=${
          projectCode !== entityCode
        }`,
      );
    },
    {
      enabled: !!projectCode && !!entityCode && !!mapOverlayCode,
    },
  );
};
