/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Component for Login Form
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { WHITE } from '../../styles';
import { Form } from '../Form';
import { TextField } from '../Form/Fields';
import { emailAddress } from '../Form/validators';
import { SubmitButton } from '../Form/common';
import { PrimaryButton } from '../../components/Buttons';
import { ForgotPassword } from './ForgotPassword';
import { RequestResetPasswordForm } from '../RequestResetPasswordForm';

const Container = styled.div`
  border-bottom: 1px solid #000;
`;

const Signup = styled.div`
  padding: 18px;
  text-align: left;
  color: ${WHITE};
  border-top: 1px solid #000;

  h4 {
    margin: 0;
  }

  button {
    height: 36.5px;
    align-self: end;
  }
`;

export const MobileLoginFormComponent = ({
  isRequestingLogin,
  loginFailedMessage,
  onAttemptUserLogin,
  openSignupOverlay,
}) => {
  const [isRequestingReset, toggleIsRequestingReset] = React.useState(false);
  const handleCancelReset = React.useCallback(() => toggleIsRequestingReset(false), []);
  const handleRequestReset = React.useCallback(() => toggleIsRequestingReset(true), []);

  return (
    <Container>
      {isRequestingReset ? (
        <RequestResetPasswordForm onClickCancel={handleCancelReset} />
      ) : (
        <Form
          isLoading={isRequestingLogin}
          formError={loginFailedMessage}
          onSubmit={({ email, password }) => onAttemptUserLogin(email, password)}
          render={submitForm => (
            <>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                validators={[emailAddress]}
                required
              />
              <TextField fullWidth label="Password" name="password" type="password" required />
              <PrimaryButton onClick={submitForm}>Sign in</PrimaryButton>
              <ForgotPassword handleClick={handleRequestReset} />
            </>
          )}
        />
      )}

      <Signup>
        <h4>Need an account?</h4>
        <p>
          Sign up to access more regions and assist in data collection using our free app for
          Android and iOS
        </p>
        <SubmitButton text="Sign up" handleClick={openSignupOverlay} />
      </Signup>
    </Container>
  );
};

MobileLoginFormComponent.propTypes = {
  isRequestingLogin: PropTypes.bool.isRequired,
  loginFailedMessage: PropTypes.string,
  onAttemptUserLogin: PropTypes.func.isRequired,
  openSignupOverlay: PropTypes.func.isRequired,
};

MobileLoginFormComponent.defaultProps = {
  loginFailedMessage: null,
};
