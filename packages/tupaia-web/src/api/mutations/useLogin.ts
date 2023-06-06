/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api.ts';

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation(
    ({ email, password }) => {
      return post('login', {
        data: {
          emailAddress: email,
          password,
          deviceName: window.navigator.userAgent,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
        navigate(-1);
      },
    },
  );
};
