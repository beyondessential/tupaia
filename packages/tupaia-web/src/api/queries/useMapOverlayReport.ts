/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { useQuery } from 'react-query';
import { momentToDateString } from '@tupaia/utils';
import { get } from '../api';
import { EntityCode, ProjectCode, SingleMapOverlayItem } from '../../types';

export const useMapOverlayReport = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
  mapOverlayCode?: SingleMapOverlayItem['code'],
  legacy?: boolean,
  params?: {
    startDate?: string;
    endDate?: string;
  },
) => {
  // convert moment dates to date strings for the endpoint to use
  const startDate = params?.startDate ? momentToDateString(params.startDate) : undefined;
  const endDate = params?.startDate ? momentToDateString(params.endDate) : undefined;
  const endpoint = legacy ? 'legacyMapOverlayReport' : 'report';
  return useQuery(
    [endpoint, projectCode, entityCode, mapOverlayCode, startDate, endDate],
    async () => {
      return get(`${endpoint}/${mapOverlayCode}`, {
        params: {
          organisationUnitCode: entityCode,
          projectCode,
          shouldShowAllParentCountryResults: projectCode !== entityCode, // TODO: figure out the logic here for shouldShowAllParentCountryResults
          startDate,
          endDate,
        },
      });
    },
    {
      enabled: !!projectCode && !!entityCode && !!mapOverlayCode,
    },
  );
};
