/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LoginForm, EMAIL_VERIFICATION_STATUS } from '@tupaia/ui-components';
import { useLogin } from '../api/mutations';
import { ROUTES } from '../constants';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  p,
  a {
    font-size: 0.8125rem;
  }
`;
export const LoginPage = ({
  message,
}: {
  message?: {
    status?: EMAIL_VERIFICATION_STATUS | string;
    text?: string;
  } | null;
}) => {
  const formContext = useForm();
  const { mutate: login, isLoading, error } = useLogin();
  return (
    <Wrapper>
      <LoginForm
        onSubmit={login as SubmitHandler<any>}
        isLoading={isLoading}
        error={error}
        forgotPasswordLink={ROUTES.FORGOT_PASSWORD}
        registerLink={ROUTES.REGISTER}
        formContext={formContext}
        message={message}
      />
    </Wrapper>
  );
};
