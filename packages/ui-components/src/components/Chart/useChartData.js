/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

export const useChartData = params => {
  return useQuery(['chart', params], async () => {
    try {
      const { data } = await axios(`${baseUrl}view`, {
        params,
        withCredentials: true,
        credentials: 'include',
      });
      return data;
    } catch (error) {
      console.log('api error', error);
      return null;
    }
  });
};
