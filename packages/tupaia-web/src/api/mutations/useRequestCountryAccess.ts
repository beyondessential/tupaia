/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { post } from '../api';
import { useSearchParams } from 'react-router-dom';
import { PROJECT_PARAM } from '../../constants';
import { CountryAccessListItem } from '../../types';

type RequestCountryAccessParams = {
  entityIds: CountryAccessListItem['id'][];
  message?: string;
};
export const useRequestCountryAccess = () => {
  const [urlParams] = useSearchParams();
  const projectCode = urlParams.get(PROJECT_PARAM);
  return useMutation<any, Error, RequestCountryAccessParams, unknown>(
    ({ entityIds, message }: RequestCountryAccessParams) => {
      return post('requestCountryAccess', {
        data: {
          entityIds: Array.isArray(entityIds) ? entityIds : [entityIds], // Ensure entityIds is an array, as when there is only one option in a checkbox list, react-hook-form formats this as a single value string
          message,
          projectCode,
        },
      });
    },
  );
};
