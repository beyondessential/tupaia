/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { TextField, Button, Checkbox } from '@tupaia/ui-components';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { login, getCurrentUser } from '../../store';
import * as COLORS from '../../constants/colors';

const ErrorMessage = styled.p`
  color: ${COLORS.RED};
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

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  ERROR: 'error',
};

const LoginFormComponent = ({ user, onLogin }) => {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMessage, setErrorMessage] = useState(null);
  const { handleSubmit, register, errors } = useForm();

  const onSubmit = handleSubmit(async ({ email, password, rememberMe }) => {
    setStatus(STATUS.LOADING);
    setErrorMessage(null);
    try {
      window.localStorage.setItem('PSSS:rememberMe', rememberMe.toString());
      await onLogin({ email, password });
    } catch (error) {
      setErrorMessage(error.message);
      setStatus(STATUS.ERROR);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <Heading component="h4">Enter your email and password</Heading>
      {status === STATUS.ERROR && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <TextField
        name="email"
        placeholder="Email"
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
      <Checkbox
        name="rememberMe"
        color="primary"
        label="Remember me"
        inputRef={register}
        defaultValue={false}
      />
      <StyledButton type="submit" fullWidth isLoading={status === STATUS.LOADING}>
        Login to your account
      </StyledButton>
    </form>
  );
};

LoginFormComponent.propTypes = {
  onLogin: PropTypes.func.isRequired,
  user: PropTypes.PropTypes.shape({
    email: PropTypes.string,
  }),
};

LoginFormComponent.defaultProps = {
  user: null,
};

const mapStateToProps = state => ({
  user: getCurrentUser(state),
});

const mapDispatchToProps = dispatch => ({
  onLogin: ({ email, password }) => dispatch(login({ email, password })),
});

export const LoginForm = connect(mapStateToProps, mapDispatchToProps)(LoginFormComponent);
