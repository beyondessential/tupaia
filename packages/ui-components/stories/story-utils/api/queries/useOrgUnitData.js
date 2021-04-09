/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';
import { useQuery } from 'react-query';

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

export const useOrgUnitData = params => {
  return useQuery(
    ['organisationUnit', params],
    () =>
      axios(`${baseUrl}organisationUnit`, {
        params,
        withCredentials: true,
        timeout: 30 * 1000,
      }).then(res => res.data),
    { staleTime: 60 * 60 * 1000 },
  );
};
