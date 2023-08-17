/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';
import { gaEvent } from '../../utils';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation('logout', () => post('logout'), {
    onMutate: () => {
      gaEvent('User', 'Log out');
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
