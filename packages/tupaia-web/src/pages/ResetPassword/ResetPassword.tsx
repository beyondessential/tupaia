/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { AuthModalBody, LoadingScreen } from '../../components';
import { OneTimeLogin } from './OneTimeLogin';
import { ResetPasswordForm } from './ResetPasswordForm';
import { URL_SEARCH_PARAMS } from '../../constants';
import { useOneTimeLogin } from '../../api/mutations';

const ModalBody = styled(AuthModalBody)`
  width: 38rem;
`;

export const ResetPassword = () => {
  const [urlSearchParams] = useSearchParams();
  const { mutate: attemptLogin, isError, isLoading, isSuccess } = useOneTimeLogin();
  const token = urlSearchParams.get(URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN);

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
