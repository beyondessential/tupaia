import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
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
  isLoading: false,
  error: null,
  forgotPasswordLink: '#',
  registerLink: '#',
  logoUrl: 'https://tupaia.org/images/tupaia-logo-dark.svg',
};

const Wrapper = props => {
  const formContext = useForm();
  return (
    <Container>
      <LoginForm
        {...{
          ...baseProps,
          formContext,
          ...props,
        }}
      />
    </Container>
  );
};

export const Simple = () => (
  <Wrapper
    {...{
      ...baseProps,
      isLoading: false,
      error: null,
    }}
  />
);

export const Loading = () => (
  <Wrapper
    {...{
      ...baseProps,
      isLoading: true,
    }}
  />
);

export const Error = () => (
  <Wrapper
    {...{
      ...baseProps,
      error: {
        message: 'Invalid username or password',
      },
    }}
  />
);

export const VerificationSuccess = () => (
  <Wrapper
    {...{
      ...baseProps,
      message: {
        status: 'success',
        text: 'Verification successful',
      },
    }}
  />
);

export const VerificationError = () => (
  <Wrapper
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
);
