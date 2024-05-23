/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Link } from '@material-ui/core';
import { LoginForm } from '@tupaia/ui-components';
import { useLogin } from '../api/mutations';

const Container = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  .MuiPaper-root {
    border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  }
`;

export const LoginPage = () => {
  const formContext = useForm();
  const { mutate: onLogin, isLoading, error } = useLogin();
  const requestAnAccountUrl = 'https://info.tupaia.org/contact';
  return (
    <Container>
      <LoginForm
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
    </Container>
  );
};
