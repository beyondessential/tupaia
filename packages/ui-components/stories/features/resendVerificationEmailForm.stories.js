/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { ResendVerificationEmailForm } from '../../src/features/Auth/ResendVerificationEmailForm';

export default {
  title: 'features/Auth/ResendVerificationEmailForm',
  component: ResendVerificationEmailForm,
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
  isLoading: false,
};

const Wrapper = props => {
  const formContext = useForm();
  return (
    <Container>
      <ResendVerificationEmailForm
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
