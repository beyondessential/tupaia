/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useLogin } from '../api/mutations';
import { TextField } from '../components/TextField';
import { AuthModal, ModalButton } from '../layout';

const StyledImg = styled.img`
  height: 2.6rem;
  width: auto;
  margin-bottom: 5rem;
`;
const Logo = () => <StyledImg src="/tupaia-logo-light.svg" alt="tupaia-logo" />;

const Title = styled(Typography)`
  font-weight: 500;
  font-size: 32px;
  line-height: 13px;
  margin-bottom: 1.6rem;
`;

const Text = styled(Typography)`
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
  margin-bottom: 0.5rem;
`;

const LinkText = styled(Typography)`
  font-weight: 400;
  font-size: 11px;
  line-height: 15px;
  color: white;

  a {
    color: white;
  }
`;

const ForgotPasswordText = styled(LinkText)`
  display: block;
  margin-top: -0.6rem;
  text-align: right;
`;

const StyledForm = styled.form`
  margin-top: 0.5rem;
  width: 340px;
  max-width: 100%;
`;

export const Login = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const { mutate: login, isLoading, isError, error } = useLogin();
  const navigate = useNavigate();

  const onClose = () => {
    navigate(-1);
  };

  const onSubmit = data => console.log(data);

  return (
    <AuthModal title="Login" subtitle="Enter your details below to log in" onClose={onClose}>
      <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          name="email"
          label="Email *"
          type="email"
          error={!!errors?.email}
          helperText={errors?.email && errors?.email.message}
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
          error={!!errors?.password}
          helperText={errors?.password && errors?.password.message}
          inputProps={register('password', {
            required: 'Required',
          })}
        />
        <ForgotPasswordText align="right" as={Link} to="/reset-password">
          Forgot password?
        </ForgotPasswordText>
        <ModalButton type="submit" isLoading={isLoading}>
          Log in
        </ModalButton>
        <LinkText align="center">
          Don't have an account? <Link to="/register">Register here</Link>
        </LinkText>
      </StyledForm>
    </AuthModal>
  );
};
