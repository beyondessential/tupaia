/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Typography from '@material-ui/core/Typography';
import { useForm } from 'react-hook-form';
import { TextField, Button } from '../../src';

const ErrorMessage = styled.p`
  color: red;
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

const baseUrl = process.env.REACT_APP_CONFIG_SERVER_BASE_URL || 'http://localhost:8000/api/v1/';

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const { handleSubmit, register, errors } = useForm();

  const onSubmit = handleSubmit(async ({ email, password }) => {
    console.log('login...', { email, password });
    try {
      const response = await axios.post(`${baseUrl}login`, {
        emailAddress: email,
        password,
        deviceName: window.navigator.userAgent,
      });
      console.log('login success', response);
    } catch (error) {
      console.log('login error', error);
    }
    // await onLogin({ email, password });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Heading component="h4">Enter your email and password</Heading>
      {/*{isError && <ErrorMessage>{error}</ErrorMessage>}*/}
      <TextField
        name="email"
        placeholder="Email"
        type="email"
        // defaultValue={user?.email}
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
      <StyledButton type="submit" fullWidth isLoading={isLoading}>
        Login to your account
      </StyledButton>
    </form>
  );
};
