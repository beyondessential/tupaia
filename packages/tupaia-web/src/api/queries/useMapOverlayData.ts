/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { EntityCode, ProjectCode, SingleMapOverlayItem } from '../../types';

export const useMapOverlayData = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  mapOverlayCode?: SingleMapOverlayItem['code'],
) => {
  return useQuery(
    ['legacyMapOverlayReport', projectCode, entityCode, mapOverlayCode],
    async () => {
      return get(`legacyMapOverlayReport/${mapOverlayCode}`, {
        params: {
          organisationUnitCode: entityCode,
          projectCode,
          shouldShowAllParentCountryResults: projectCode !== entityCode, // TODO: figure out the logic here for shouldShowAllParentCountryResults
        },
      });
    },
    {
      enabled: !!projectCode && !!entityCode && !!mapOverlayCode,
    },
  );
};
