/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

export const useChartData = params => {
  return useQuery(
    ['chart', params],
    () => {
      return axios(`${baseUrl}view`, {
        params: {
          ...params,
        },
        withCredentials: true,
        credentials: 'include',
        timeout: 3000,
      }).then(res => res.data);
    },
    { staleTime: 60 * 60 * 1000 },
  );
};
