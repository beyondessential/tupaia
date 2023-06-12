/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation, useQueryClient } from 'react-query';
import { post } from '../api';
import { useNavigateBack } from '../../utils/useNavigateBack';

// Todo: replace with request body type from backend
type RegisterUserBody = {
  contactNumber?: string;
  emailAddress: string;
  employer: string;
  firstName: string;
  lastName: string;
  passwordConfirm: string;
  password: string;
  position: string;
};
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigateBack = useNavigateBack();

  return useMutation<any, Error, RegisterUserBody, unknown>(
    (data: RegisterUserBody) => {
      return post('signup', { data });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries();
        navigateBack();
      },
    },
  );
};
