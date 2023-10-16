/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { ResetPasswordForm } from '../../src/features/Auth/ResetPasswordForm';

export default {
  title: 'features/Auth/ResetPasswordForm',
  component: ResetPasswordForm,
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
};

const Wrapper = props => {
  const formContext = useForm();
  return (
    <Container>
      <ResetPasswordForm
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
        message: 'Invalid password',
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
