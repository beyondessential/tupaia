/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { post } from '../api';

export const useLogout = () => {
  const history = useHistory();
  const queryClient = useQueryClient();

  const query = useMutation(() => post('logout'), {
    onSuccess: () => {
      queryClient.clear();
      history.push('/');
    },
  });

  return query;
};
