/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { Button, Checkbox } from '@tupaia/ui-components';

import { TextField } from '../../../components/TextField';
import { I18n, useI18n } from '../../../utils';
import { changeEmailAddress, changeRememberMe, login } from './actions';
import { getEmailAddress, getErrorMessage, getIsLoading, getRememberMe } from './selectors';

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
  rememberMe,
  errorMessage,
  isLoading,
  onChangeEmailAddress,
  onChangeRememberMe,
  onLogin,
}) => {
  const { translate } = useI18n();
  const { watch, register } = useForm();
  const password = watch('password');
  return (
    <form onSubmit={event => onLogin(event, password)} noValidate>
      <Heading component="h4">{translate('login.enterYourEmailAndPassword')}</Heading>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <TextField
        value={emailAddress}
        name="email"
        placeholder={translate('login.email')}
        type="email"
        onChange={onChangeEmailAddress}
      />
      <TextField
        name="password"
        type="password"
        placeholder={translate('login.password')}
        inputRef={register()}
      />
      <Checkbox
        name="remember"
        color="primary"
        label={translate('login.rememberMe')}
        checked={rememberMe}
        onChange={onChangeRememberMe}
      />
      <StyledButton type="submit" fullWidth isLoading={isLoading}>
        <I18n t="login.loginToYourAccount" />
      </StyledButton>
    </form>
  );
};

LoginFormComponent.propTypes = {
  emailAddress: PropTypes.string.isRequired,
  rememberMe: PropTypes.bool,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  onChangeEmailAddress: PropTypes.func.isRequired,
  onChangeRememberMe: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};

LoginFormComponent.defaultProps = {
  errorMessage: null,
  isLoading: false,
  rememberMe: false,
};

const mapStateToProps = state => ({
  emailAddress: getEmailAddress(state),
  rememberMe: getRememberMe(state),
  errorMessage: getErrorMessage(state),
  isLoading: getIsLoading(state),
});

const mergeProps = (stateProps, { dispatch }, ownProps) => ({
  ...ownProps,
  ...stateProps,
  onChangeEmailAddress: event => dispatch(changeEmailAddress(event.target.value)),
  onChangeRememberMe: event => dispatch(changeRememberMe(event.target.checked)),
  onLogin: (event, password) => {
    event.preventDefault();
    dispatch(login(stateProps.emailAddress, password));
  },
});

export const LoginForm = connect(mapStateToProps, null, mergeProps)(LoginFormComponent);
