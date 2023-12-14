/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { Country } from '@tupaia/types';
import { post } from '../api';

type RequestCountryAccessParams = {
  entityIds: Country['id'][];
  message?: string;
  projectCode?: string;
};
export const useRequestProjectAccess = (options?: {
  onError?: (error: Error) => void;
  onSettled?: () => void;
  onSuccess?: () => void;
}) => {
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
      onError: (error: Error) => {
        if (options?.onError) options.onError(error);
      },
      onSettled: () => {
        if (options?.onSettled) options.onSettled();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['projects'],
        });

        if (options?.onSuccess) options.onSuccess();
      },
    },
  );
};
