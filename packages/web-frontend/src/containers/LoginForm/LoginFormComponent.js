/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { FlexSpaceBetween } from '../../components/Flexbox';

import { Form } from '../Form';
import { TextField } from '../Form/Fields';
import { emailAddress } from '../Form/validators';
import { ForgotPassword } from './ForgotPassword';
import { SubmitButton } from '../Form/common';
import { SignupComplete } from '../SignupForm/SignupComplete';
import { EmailVerification, EMAIL_VERIFIED_STATUS } from '../EmailVerification';

const PasswordField = styled(TextField)`
  margin-bottom: 16px;
`;

export const LoginFormComponent = React.memo(
  ({
    isRequestingLogin,
    loginFailedMessage,
    onClickResetPassword,
    onAttemptUserLogin,
    successMessage,
    emailVerified,
  }) => {
    const [shouldShowVerifyForm, setVerifyForm] = useState(false);

    const showVerifyForm = useCallback(() => setVerifyForm(true), []);
    const onSubmit = useCallback(({ email, password }) => onAttemptUserLogin(email, password), [
      onAttemptUserLogin,
    ]);
    const renderForm = useCallback(
      submitForm => (
        <>
          <TextField
            id="login-email"
            fullWidth
            label="E-mail"
            name="email"
            validators={[emailAddress]}
            required
          />
          <PasswordField
            id="login-password"
            fullWidth
            label="Password"
            name="password"
            type="password"
            required
            onKeyPress={e => e.key === 'Enter' && submitForm(e)}
          />
          <FlexSpaceBetween>
            <ForgotPassword handleClick={onClickResetPassword} />
            <SubmitButton handleClick={submitForm}>Sign in</SubmitButton>
          </FlexSpaceBetween>
        </>
      ),
      [onClickResetPassword],
    );

    if (shouldShowVerifyForm) return <EmailVerification />;
    if (emailVerified === EMAIL_VERIFIED_STATUS.NEW_USER) {
      return <SignupComplete onClickResend={showVerifyForm} />;
    }

    return (
      <Form
        onSubmit={onSubmit}
        isLoading={isRequestingLogin}
        formError={loginFailedMessage}
        formSuccess={successMessage}
        render={renderForm}
      />
    );
  },
);

LoginFormComponent.propTypes = {
  isRequestingLogin: PropTypes.bool.isRequired,
  loginFailedMessage: PropTypes.string,
  onAttemptUserLogin: PropTypes.func.isRequired,
  onClickResetPassword: PropTypes.func.isRequired,
  successMessage: PropTypes.string,
  emailVerified: PropTypes.string,
};

LoginFormComponent.defaultProps = {
  loginFailedMessage: null,
  successMessage: null,
  emailVerified: null,
};
