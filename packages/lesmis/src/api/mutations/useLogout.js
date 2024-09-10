/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api';
import { useHomeUrl } from '../../utils/useHomeUrl';

export const useLogout = () => {
  const { navigateToHomeUrl } = useHomeUrl();
  const queryClient = useQueryClient();

  return useMutation(() => post('logout'), {
    onSuccess: () => {
      queryClient.clear();
      navigateToHomeUrl();
    },
  });
};
