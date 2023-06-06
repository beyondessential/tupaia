/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { Button } from '@tupaia/ui-components';
import { useLogin } from '../api/mutations';
import { TextField } from '../components/forms/TextField.tsx';

const Container = styled.div`
  background: #2e2f33;
  margin: 1rem auto;
  max-width: 1000px;
  height: 600px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledImg = styled.img`
  height: 2.6rem;
  width: auto;
  margin-bottom: 2.5rem;
`;
const Logo = () => <StyledImg src="/tupaia-logo-light.svg" alt="psss-logo" />;

const Title = styled.h1`
  font-weight: 500;
  font-size: 32px;
  line-height: 13px;
`;

const Text = styled.h2`
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
`;

const LinkText = styled.div`
  font-weight: 400;
  font-size: 11px;
  line-height: 15px;
`;

const StyledForm = styled.form`
  margin-top: 1rem;
  width: 340px;
  max-width: 100%;

  button {
    width: 100%;
    margin-top: 1rem;
    margin-bottom: 1rem;
    text-transform: none;
  }
`;

export const LoginForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const { mutate: login, isLoading } = useLogin();

  return (
    <Container>
      <Logo />
      <Title>Log in</Title>
      <Text>Enter your details below to log in</Text>
      <StyledForm onSubmit={handleSubmit(login)} noValidate>
        <TextField
          name="email"
          label="Email *"
          type="email"
          error={!!errors.email}
          helperText={errors.email && errors.email.message}
          inputProps={register('email', {
            required: 'Required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'invalid email address',
            },
          })}
        />
        <TextField
          name="password"
          label="Password *"
          type="password"
          error={!!errors.password}
          helperText={errors.password && errors.password.message}
          inputProps={register('password', {
            required: 'Required',
          })}
        />
        <LinkText>Forgot password?</LinkText>
        <Button type="submit" isLoading={isLoading}>
          Log in
        </Button>
        <LinkText>Don't have an account? Register here</LinkText>
      </StyledForm>
    </Container>
  );
};
