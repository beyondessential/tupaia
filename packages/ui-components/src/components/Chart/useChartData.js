/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import axios from 'axios';
import { getDefaultDates, formatDateForApi } from './periodGranularities';

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

export const useChartData = ({ defaultTimePeriod, periodGranularity, ...props }) => {
  const { startDate, endDate } = getDefaultDates({ periodGranularity, defaultTimePeriod });
  const params = {
    ...props,
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };

  return useQuery(
    ['chart', params],
    () => {
      return axios(`${baseUrl}view`, {
        params,
        withCredentials: true,
        credentials: 'include',
        timeout: 30 * 1000,
      }).then(res => res.data);
    },
    { staleTime: 60 * 60 * 1000 },
  );
};
