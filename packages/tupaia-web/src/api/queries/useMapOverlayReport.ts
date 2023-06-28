/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { EntityCode, ProjectCode } from '../../types';
import { MapOverlay } from '@tupaia/types';

export const useMapOverlayReport = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  mapOverlayCode?: MapOverlay['code'] | null,
) => {
  const query = useQuery(
    ['legacyMapOverlayReport', projectCode, entityCode, mapOverlayCode],
    async () => {
      return get(`legacyMapOverlayReport/${mapOverlayCode}`, {
        params: {
          organisationUnitCode: entityCode,
          projectCode,
          shouldShowAllParentCountryResults: projectCode !== entityCode,
        },
      });
    },
    {
      enabled: !!projectCode && !!entityCode && !!mapOverlayCode,
    },
  );

  return { ...query };
};
