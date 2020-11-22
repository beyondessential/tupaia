/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TextField, Button, Checkbox } from '@tupaia/ui-components';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { login, checkIsPending, checkIsError, getError, getCurrentUser } from '../../store';
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

const LoginFormComponent = ({ user, isPending, isError, error, onLogin }) => {
  const { handleSubmit, register, errors } = useForm();
  return (
    <form
      onSubmit={handleSubmit(({ email, password, rememberMe }) => {
        onLogin({ email, password });
        window.localStorage.setItem('PSSS:rememberMe', rememberMe.toString());
      })}
      noValidate
    >
      <Heading component="h4">Enter your email and password</Heading>
      {isError && <ErrorMessage>{error}</ErrorMessage>}
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
      <StyledButton type="submit" fullWidth isLoading={isPending}>
        Login to your account
      </StyledButton>
    </form>
  );
};

LoginFormComponent.propTypes = {
  isError: PropTypes.any.isRequired,
  isPending: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onLogin: PropTypes.func.isRequired,
  user: PropTypes.PropTypes.shape({
    email: PropTypes.string,
  }),
};

LoginFormComponent.defaultProps = {
  user: null,
  error: null,
};

const mapStateToProps = state => ({
  user: getCurrentUser(state),
  isPending: checkIsPending(state),
  isError: checkIsError(state),
  error: getError(state),
});

const mapDispatchToProps = dispatch => ({
  onLogin: ({ email, password }) => dispatch(login({ email, password })),
});

export const LoginForm = connect(mapStateToProps, mapDispatchToProps)(LoginFormComponent);
