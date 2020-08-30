/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TextField, Button, Checkbox } from '@tupaia/ui-components';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getEmailAddress, getErrorMessage, getPassword } from './selectors';
import { changeEmailAddress, changePassword, login } from './actions';

const ErrorMessage = styled.p`
  color: ${props => props.theme.palette.error.main};
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

const LoginFormComponent = ({
  emailAddress,
  password,
  errorMessage,
  onChangeEmailAddress,
  onChangePassword,
  onLogin,
}) => {
  return (
    <form onSubmit={onLogin} noValidate>
      <Heading component="h4">Enter your email and password</Heading>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <TextField
        value={emailAddress}
        name="email"
        placeholder="Email"
        type="email"
        onChange={onChangeEmailAddress}
      />
      <TextField
        value={password}
        name="password"
        type="password"
        placeholder="Password"
        onChange={onChangePassword}
      />
      {/* Todo: <Checkbox name="remember" color="primary" label="Remember me" defaultValue={false} />*/}
      <StyledButton type="submit" fullWidth>
        Login to your account
      </StyledButton>
    </form>
  );
};

LoginFormComponent.propTypes = {
  emailAddress: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  errorMessage: PropTypes.string,
  onChangeEmailAddress: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

LoginFormComponent.defaultProps = {
  errorMessage: null,
};

const mapStateToProps = state => ({
  emailAddress: getEmailAddress(state),
  password: getPassword(state),
  errorMessage: getErrorMessage(state),
});

const mergeProps = (stateProps, { dispatch }, ownProps) => ({
  ...ownProps,
  ...stateProps,
  onChangeEmailAddress: event => dispatch(changeEmailAddress(event.target.value)),
  onChangePassword: event => dispatch(changePassword(event.target.value)),
  onLogin: event => {
    event.preventDefault();
    dispatch(login(stateProps.emailAddress, stateProps.password));
  },
});

export const LoginForm = connect(mapStateToProps, null, mergeProps)(LoginFormComponent);
