/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { TextField, Button } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
// import { Typography, TextField, Button } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import * as COLORS from '../constants';
import { useLogin } from '../api/mutations';

const ErrorMessage = styled(Typography)`
  text-align: center;
  color: ${COLORS.RED};
  margin: -1rem 0 1rem;
`;

const SuccessMessage = styled(Typography)`
  text-align: center;
  color: ${COLORS.GREEN};
  margin: -1rem 0 1rem;
`;

const Heading = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.primary};
  text-align: center;
  margin-bottom: 2rem;
`;

const StyledButton = styled(Button)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

export const LoginForm = () => {
  const { handleSubmit, register, errors } = useForm();
  const { mutate: login, user, isError, isLoading, isSuccess, error } = useLogin();

  return (
    <form onSubmit={handleSubmit(({ email, password }) => login({ email, password }))} noValidate>
      <Heading variant="h4">Enter your email address</Heading>
      {isError ? <ErrorMessage>{error.message}</ErrorMessage> : null}
      <TextField
        name="email"
        placeholder="Email address"
        type="email"
        defaultValue={user?.email}
        error={!!errors.email}
        helperText={errors.email && errors.email.message}
        inputRef={register({
          required: 'Required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'invalid email address',
          },
        })}
      />
      <TextField
        name="password"
        type="password"
        placeholder="Password"
        error={!!errors.password}
        helperText={errors.password && errors.password.message}
        inputRef={register({
          required: 'Required',
        })}
      />

      <StyledButton type="submit" fullWidth isLoading={isLoading || isSuccess}>
        Login
      </StyledButton>
    </form>
  );
};
