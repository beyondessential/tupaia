/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import { useMutation } from '@tanstack/react-query';
import { post } from '../api';

export const useRegisterUser = () => {
  const query = useMutation(
    ({
      firstName,
      lastName,
      emailAddress,
      contactNumber,
      employer,
      position,
      password,
      passwordConfirm,
    }) =>
      post('register', {
        data: {
          firstName,
          lastName,
          emailAddress,
          contactNumber,
          employer,
          position,
          password,
          passwordConfirm,
          deviceName: window.navigator.userAgent,
          primaryPlatform: 'lesmis',
        },
      }),
  );

  return query;
};
