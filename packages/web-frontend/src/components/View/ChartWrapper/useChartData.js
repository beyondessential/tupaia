/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { useQuery } from 'react-query';
import axios from 'axios';

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8080/api/v1/';

export const useChartData = params => {
  console.log('baseUrl', baseUrl);
  return useQuery('chart', async () => {
    try {
      const { data } = await axios(`${baseUrl}view`, {
        params,
      });
      return data;
    } catch (error) {
      console.log('api error', error);
      return null;
    }
  });
};
