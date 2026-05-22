import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { LoginForm } from '@tupaia/ui-components';
import { useLogin } from '../api/mutations';
import { RegisterLink } from '../authentication';
import { AUTH_ROUTES } from '../routes';

export const LoginPage = ({ labels, homeLink }) => {
  const formContext = useForm();
  const { mutate: onLogin, isLoading, error } = useLogin(homeLink);

  return (
    <LoginForm
      onSubmit={onLogin}
      isLoading={isLoading}
      error={error}
      formContext={formContext}
      forgotPasswordLink={AUTH_ROUTES.FORGOT_PASSWORD}
      RegisterLinkComponent={<RegisterLink text={labels?.register} />}
      labels={labels}
    />
  );
};

LoginPage.propTypes = {
  labels: PropTypes.object,
  homeLink: PropTypes.string,
};

LoginPage.defaultProps = {
  labels: {},
  homeLink: '/',
};
