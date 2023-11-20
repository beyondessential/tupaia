/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { post } from '../api';

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
  return useMutation<any, Error, RegisterUserBody, unknown>(
    (data: RegisterUserBody) => {
      return post('signup', { data });
    },
    {
      meta: {
        applyCustomErrorHandling: true,
      },
    },
  );
};
