/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '@tupaia/ui-components';
import { PASSWORD_RESET_TOKEN_PARAM, ROUTES } from '../constants';
import { useResetPassword } from '../api/mutations';

export const ResetPasswordPage = () => {
  const [urlSearchParams] = useSearchParams();
  const passwordResetToken = urlSearchParams.get(PASSWORD_RESET_TOKEN_PARAM);
  const formContext = useForm();
  const { mutate: onResetPassword, isLoading, error, isSuccess } = useResetPassword();
  return (
    <ResetPasswordForm
      passwordResetToken={passwordResetToken}
      onSubmit={onResetPassword as SubmitHandler<any>}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      loginLink={ROUTES.LOGIN}
      formContext={formContext}
    />
  );
};
