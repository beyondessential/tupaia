/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { post } from '../../VizBuilderApp/api';

export const useOneTimeLogin = () => {
  const queryClient = useQueryClient();
  return useMutation(
    token => {
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
