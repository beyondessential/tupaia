/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import axios from 'axios';
import { useQuery } from 'react-query';
import { PROJECT_CODE, COUNTRY_CODE } from '../../constants';
import { useUrlParams } from '../../utils';

// Todo: update org Unit data fetch once EntityServer is ready
// const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';
const baseUrl = 'http://localhost:8000/api/v1/';

export const useOrgUnitData = ({ organisationUnitCode, includeCountryData = false }) => {
  const params = {
    organisationUnitCode,
    projectCode: PROJECT_CODE,
    includeCountryData,
  };

  return useQuery(
    ['organisationUnit', params],
    () =>
      axios(`${baseUrl}organisationUnit`, {
        params,
        withCredentials: true,
        timeout: 30 * 1000,
      }).then(res => res.data),
    { staleTime: 1000 * 60 * 60 * 1, refetchOnWindowFocus: false },
  );
};

export const useCurrentOrgUnitData = ({ includeCountryData = false } = {}) => {
  const { organisationUnitCode } = useUrlParams();
  return useOrgUnitData({ organisationUnitCode, includeCountryData });
};

export const useCountryHeirarchyData = () =>
  useOrgUnitData({ organisationUnitCode: COUNTRY_CODE, includeCountryData: true });
