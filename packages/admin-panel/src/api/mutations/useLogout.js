/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router';
import { post } from '../../VizBuilderApp/api';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation('logout', () => post('logout'), {
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate('/login');
    },
  });
};
