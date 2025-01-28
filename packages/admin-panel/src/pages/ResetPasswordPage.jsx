import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useSearchParams, Link } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { SpinningLoader, ResetPasswordForm, AuthSubmitButton } from '@tupaia/ui-components';
import { useResetPassword, useOneTimeLogin } from '../api/mutations';
import { PASSWORD_RESET_TOKEN_PARAM } from '../authentication';
import { AUTH_ROUTES } from '../routes';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-inline: 2rem;
  padding-block: 3rem;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  background: ${({ theme }) => theme.palette.background.paper};
  width: 36rem;
  h2 {
    margin-block-end: 2rem;
    font-size: 2rem;
    text-align: center;
  }
  p {
    margin-block-end: 0.5rem;
  }
`;

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

  if (oneTimeLoginError) {
    return (
      <Content>
        <Typography variant="h2">Error</Typography>
        <Typography>The email link has expired or already been used.</Typography>
        <AuthSubmitButton to={AUTH_ROUTES.FORGOT_PASSWORD} component={Link}>
          Request a new password reset link
        </AuthSubmitButton>
      </Content>
    );
  }

  return (
    <ResetPasswordForm
      passwordResetToken={passwordResetToken}
      onSubmit={onResetPassword}
      isLoading={isSubmitting}
      error={submitError}
      isSuccess={submitSuccess}
      loginLink={AUTH_ROUTES.LOGIN}
      formContext={formContext}
    />
  );
};
