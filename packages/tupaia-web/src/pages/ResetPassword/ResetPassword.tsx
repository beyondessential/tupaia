/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { AuthModalBody, LoadingScreen } from '../../components';
import { OneTimeLogin } from './OneTimeLogin';
import { ResetPasswordForm } from './ResetPasswordForm';
import { PASSWORD_RESET_TOKEN_PARAM } from '../../constants';
import { useOneTimeLogin } from '../../api/mutations';

const ModalBody = styled(AuthModalBody)`
  width: 38rem;
`;

export const ResetPassword = () => {
  const [urlParams] = useSearchParams();
  const { mutate: attemptLogin, isError, isLoading, isSuccess } = useOneTimeLogin();
  const token = urlParams.get(PASSWORD_RESET_TOKEN_PARAM);

  const handleLogin = () => {
    attemptLogin({ token } as {
      token: string;
    });
  };

  return (
    <ModalBody title="Change password">
      <LoadingScreen isLoading={isLoading} />
      {token && !isSuccess ? (
        <OneTimeLogin attemptLogin={handleLogin} isError={isError} />
      ) : (
        <ResetPasswordForm />
      )}
    </ModalBody>
  );
};
