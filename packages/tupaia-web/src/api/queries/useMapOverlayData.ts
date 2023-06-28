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
    ['mapOverlayData', projectCode, entityCode, mapOverlayCode],
    async () => {
      return get('measureData', {
        params: {
          mapOverlayCode,
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
