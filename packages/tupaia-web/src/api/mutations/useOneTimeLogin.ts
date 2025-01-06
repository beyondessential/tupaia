/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '../api';

type LoginCredentials = {
  token: string;
};

export const useOneTimeLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, LoginCredentials, unknown>(
    ({ token }: LoginCredentials) => {
      return post('login/oneTimeLogin', {
        data: {
          token,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    },
  );
};
