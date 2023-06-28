/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { EntityCode, ProjectCode } from '../../types';

export const useFetchMapOverlays = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  return useQuery(
    ['mapOverlays', projectCode, entityCode],
    async () => {
      return get(`mapOverlays/${projectCode}/${entityCode}`);
    },
    {
      enabled: !!projectCode && !!entityCode,
    },
  );
};
