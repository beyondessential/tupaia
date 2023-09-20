/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';
import { Country } from '@tupaia/types';

type RequestCountryAccessParams = {
  entityIds: Country['id'][];
  message?: string;
  projectCode?: string;
};
export const useRequestProjectAccess = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, RequestCountryAccessParams, unknown>(
    ({ entityIds, message, projectCode }: RequestCountryAccessParams) => {
      return post('me/requestCountryAccess', {
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
