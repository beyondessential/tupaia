/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';
import { useSearchParams } from 'react-router-dom';
import { URL_SEARCH_PARAMS } from '../../constants';
import { CountryAccessListItem } from '../../types';

type RequestCountryAccessParams = {
  entityIds: CountryAccessListItem['id'][];
  message?: string;
};
export const useRequestCountryAccess = () => {
  const queryClient = useQueryClient();
  const [urlSearchParams] = useSearchParams();
  const projectCode = urlSearchParams.get(URL_SEARCH_PARAMS.PROJECT);
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
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['projects'],
        });
      },
    },
  );
};
