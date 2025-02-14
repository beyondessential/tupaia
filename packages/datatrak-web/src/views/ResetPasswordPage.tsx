import React, { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { SpinningLoader } from '@tupaia/ui-components';
import { ResetPasswordForm } from '@tupaia/ui-components';
import { PASSWORD_RESET_TOKEN_PARAM, ROUTES } from '../constants';
import { useResetPassword, useOneTimeLogin } from '../api/mutations';

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
    attemptLogin(passwordResetToken!);
  }, []);

  if (isLoading || isIdle) {
    return <SpinningLoader />;
  }

  const error = oneTimeLoginError || submitError;

  return (
    <ResetPasswordForm
      passwordResetToken={passwordResetToken}
      onSubmit={onResetPassword as SubmitHandler<any>}
      isLoading={isSubmitting}
      error={error}
      isSuccess={submitSuccess}
      loginLink={ROUTES.LOGIN}
      formContext={formContext}
    />
  );
};
