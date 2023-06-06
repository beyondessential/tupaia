/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { TextField, Button } from '@tupaia/ui-components';
import { post } from '../api';

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

const FormContainer = styled.div`
  margin-top: 1rem;
`;

const useLogin = () => {
  const queryClient = useQueryClient();

  const query = useMutation(
    data => {
      console.log('data', data);
      return post('login', {
        data: {
          emailAddress: data.email,
          password: data.password,
          deviceName: window.navigator.userAgent,
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.clear();
      },
    },
  );

  return query;
};
export const LoginForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const { mutate: login } = useLogin();

  console.log('errors', errors);

  return (
    <Container>
      <Logo />
      <Title>Log in</Title>
      <Text>Enter your details below to log in</Text>
      <FormContainer>
        <form onSubmit={handleSubmit(login)} noValidate>
          <TextField
            name="email"
            label="email"
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
            label="password"
            type="password"
            error={!!errors.password}
            helperText={errors.password && errors.password.message}
            inputProps={register('password', {
              required: 'Required',
            })}
          />
          <Button type="submit">Submit</Button>
        </form>
      </FormContainer>
    </Container>
  );
};
