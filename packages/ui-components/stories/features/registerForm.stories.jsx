import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { RegisterForm } from '../../src/features/Auth/RegisterForm';

export default {
  title: 'features/Auth/RegisterForm',
  component: RegisterForm,
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

const baseProps = {
  onSubmit: values => {
    console.log('values', values);
  },
  isSuccess: false,
  error: null,
  loginLink: '#',
  successMessage: 'Your account has been created. Please check your email for a verification link.',
  verifyResendLink: '#',
};

const Wrapper = props => {
  const formContext = useForm();
  return (
    <Container>
      <RegisterForm
        {...{
          ...baseProps,
          formContext,
          ...(props || {}),
        }}
      />
    </Container>
  );
};

export const Simple = () => <Wrapper />;

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

export const Success = () => (
  <Wrapper
    {...{
      ...baseProps,
      isSuccess: true,
    }}
  />
);
