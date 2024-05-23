/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { SpinningLoader, ResetPasswordForm } from '@tupaia/ui-components';
import { useResetPassword, useOneTimeLogin } from '../api/mutations';
import { PASSWORD_RESET_TOKEN_PARAM } from '../authentication';
import { AUTH_ROUTES } from '../routes';

export const ResetPasswordPage = () => {
  const [urlSearchParams] = useSearchParams();
  const passwordResetToken = urlSearchParams.get(PASSWORD_RESET_TOKEN_PARAM);
  const formContext = useForm();
  const {
    mutate: onResetPassword,
    isLoading: isSubmitting,
    error: submitError,
    isSuccess: submitSuccess,
  } = useResetPassword();
  const { mutate: attemptLogin, error: oneTimeLoginError, isLoading, isIdle } = useOneTimeLogin();

  useEffect(() => {
    if (!passwordResetToken) return;
    attemptLogin(passwordResetToken);
  }, []);

  if (isLoading || isIdle) {
    return <SpinningLoader />;
  }

  const error = oneTimeLoginError || submitError;

  return (
    <ResetPasswordForm
      passwordResetToken={passwordResetToken}
      onSubmit={onResetPassword}
      isLoading={isSubmitting}
      error={error}
      isSuccess={submitSuccess}
      loginLink={AUTH_ROUTES.LOGIN}
      formContext={formContext}
    />
  );
};
