/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { put } from '../api';

export const useUpdateUserEntityPermission = () => {
  const queryClient = useQueryClient();

  return useMutation(
    data => {
      return put('userEntityPermission', {
        data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    },
  );
};
