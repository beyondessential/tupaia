/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Link } from '@material-ui/core';
import { LoginForm as UILoginForm } from '@tupaia/ui-components';
import { useForm } from 'react-hook-form';
import { useLogin } from '../api/mutations';

const requestAnAccountUrl = 'https://info.tupaia.org/contact';

export const LoginForm = () => {
  const formContext = useForm();
  const { mutate: onLogin, isLoading, error } = useLogin();
  return (
    <UILoginForm
      onSubmit={onLogin}
      isLoading={isLoading}
      error={error}
      formContext={formContext}
      RegisterLinkComponent={
        <Link href={requestAnAccountUrl} target="_blank">
          Request an account here
        </Link>
      }
    />
  );
};
