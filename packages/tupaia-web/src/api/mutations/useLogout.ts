/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { get } from '../api';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation('logout', () => get('logout'), {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};
