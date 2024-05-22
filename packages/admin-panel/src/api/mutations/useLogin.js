/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { post } from '../../VizBuilderApp/api';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  return useMutation(
    ({ email, password }) => {
      return post('login', {
        data: {
          emailAddress: email,
          password,
        },
      });
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        if (from) {
          navigate(from, {
            state: null,
          });
        } else {
          navigate('/', {
            state: from,
          });
        }
      },
    },
  );
};
