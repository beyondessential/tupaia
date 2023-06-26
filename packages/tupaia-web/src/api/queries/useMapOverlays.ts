/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';

export const useMapOverlays = (projectCode?: string, entityCode?: string) => {
  return useQuery(
    ['mapOverlays', projectCode, entityCode],
    async () => {
      return get(`mapOverlays/${projectCode}/${entityCode}`);
    },
    {
      enabled: !!projectCode && !!entityCode,
      placeholderData: {
        mapOverlays: [],
      },
    },
  );
};
