/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { LoginForm } from '../../src/features/Auth/LoginForm';

export default {
  title: 'features/Auth/LoginForm',
  component: LoginForm,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

const baseProps = {
  onSubmit: values => {
    console.log('values', values);
  },
  forgotPasswordLink: '#',
  registerLink: '#',
  logoUrl: 'https://tupaia.org/images/tupaia-logo-dark.svg',
};

export const Simple = () => (
  <Container>
    <LoginForm
      {...{
        ...baseProps,
        isLoading: false,
        error: null,
      }}
    />
  </Container>
);

export const Loading = () => (
  <Container>
    <LoginForm
      {...{
        ...baseProps,
        isLoading: true,
        error: null,
      }}
    />
  </Container>
);

export const Error = () => (
  <Container>
    <LoginForm
      {...{
        ...baseProps,
        isLoading: false,
        error: {
          message: 'Invalid username or password',
        },
      }}
    />
  </Container>
);

export const VerificationSuccess = () => (
  <Container>
    <LoginForm
      {...{
        ...baseProps,
        isLoading: false,
        error: null,
        message: {
          status: 'success',
          text: 'Verification successful',
        },
      }}
    />
  </Container>
);

export const VerificationError = () => (
  <Container>
    <LoginForm
      {...{
        ...baseProps,
        isLoading: false,
        error: null,
        message: {
          status: 'error',
          text: 'Invalid verification code',
        },
      }}
    />
  </Container>
);
