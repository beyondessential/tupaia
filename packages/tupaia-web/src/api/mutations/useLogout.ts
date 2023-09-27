/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { post } from '../api';
import { gaEvent } from '../../utils';
import { DEFAULT_URL, MODAL_ROUTES } from '../../constants';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation('logout', () => post('logout'), {
    onMutate: () => {
      gaEvent('User', 'Log out');
    },
    onSuccess: () => {
      navigate(`${DEFAULT_URL}#${MODAL_ROUTES.LOGIN}`);
      queryClient.invalidateQueries();
    },
  });
};
