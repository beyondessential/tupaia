/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { post } from '../api';

export const useLogout = () => {
  const { push } = useHistory();
  const queryClient = useQueryClient();

  return useMutation(() => post('logout'), {
    onSuccess: () => {
      queryClient.clear();
      push('/');
    },
  });
};
