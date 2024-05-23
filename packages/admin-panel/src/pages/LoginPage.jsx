/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { LoginForm } from '@tupaia/ui-components';
import { useLogin } from '../api/mutations';
import { RegisterLink } from '../authentication';
import { AUTH_ROUTES } from '../routes';

export const LoginPage = () => {
  const formContext = useForm();
  const { mutate: onLogin, isLoading, error } = useLogin();
  return (
    <LoginForm
      onSubmit={onLogin}
      isLoading={isLoading}
      error={error}
      formContext={formContext}
      forgotPasswordLink={AUTH_ROUTES.FORGOT_PASSWORD}
      RegisterLinkComponent={<RegisterLink />}
    />
  );
};
