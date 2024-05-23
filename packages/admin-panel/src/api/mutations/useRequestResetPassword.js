/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { useMutation } from 'react-query';
import { post } from '../../VizBuilderApp/api';

export const useRequestResetPassword = () => {
  return useMutation(({ emailAddress }) => {
    return post('auth/resetPassword', {
      data: {
        emailAddress,
        resetPasswordUrl: window.location.origin,
      },
    });
  });
};
