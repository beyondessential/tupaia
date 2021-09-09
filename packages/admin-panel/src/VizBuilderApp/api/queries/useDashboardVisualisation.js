/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import { get } from '../api';
import { DEFAULT_REACT_QUERY_OPTIONS } from '../constants';

export const useDashboardVisualisation = (visualisationId, enabled) =>
  useQuery(
    ['dashboardVisualisation', visualisationId],
    async () => get(`dashboardVisualisation/${visualisationId}`),
    {
      ...DEFAULT_REACT_QUERY_OPTIONS,
      enabled,
    },
  );
