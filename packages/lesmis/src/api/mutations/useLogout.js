/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';

export const useLogout = () => {
  const queryClient = useQueryClient();

  const query = useMutation(() => post('logout'), {
    onSuccess: () => {
      queryClient.resetQueries('user');
      queryClient.resetQueries('entity');
      queryClient.resetQueries('entities');
    },
  });

  return query;
};
