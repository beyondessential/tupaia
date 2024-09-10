/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { put } from '../../VizBuilderApp/api';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation(
    payload => {
      return put('me', {
        data: payload,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user']);
      },
    },
  );
};
