import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { ForgotPasswordForm } from '../../src/features/Auth/ForgotPasswordForm';

export default {
  title: 'features/Auth/ForgotPasswordForm',
  component: ForgotPasswordForm,
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
  loginLink: '#',
  registerLink: '#',
};

const Wrapper = props => {
  const formContext = useForm();
  return (
    <Container>
      <ForgotPasswordForm
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
        message: 'Invalid email',
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
