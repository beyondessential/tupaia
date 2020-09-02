/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PrimaryButton } from '../../components/Buttons';
import { Form } from '../Form';

const FormErrorMessage = styled.div`
  background: #fcf8e2;
  border: 1px solid #faecca;
  box-sizing: border-box;
  border-radius: 3px;
  padding: 15px;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 10px;
  color: #8b6e37;
`;

const Link = styled.a`
  color: #2096f3;
`;

const Container = styled.div`
  padding: 15px 0 0;
`;

const Text = styled.div`
  font-size: 18px;
`;

export const ResetPasswordOneTimeLoginFormComponent = ({
  isRequestingLogin,
  onAttemptOneTimeLogin,
  oneTimeLoginFailedMessage,
  passwordResetToken,
  onNavigateToRequestPasswordReset,
}) => (
  <Container>
    <Form
      isLoading={isRequestingLogin}
      onSubmit={() => onAttemptOneTimeLogin(passwordResetToken)}
      render={submitForm => (
        <>
          {oneTimeLoginFailedMessage && (
            <FormErrorMessage>
              <div>The email link has expired or already been used.</div>
              {
                // eslint complains (correctly) that this isn't a real link, it can be changed after #770 implemented
                /* eslint-disable */
              }
              <Link
                href="#request-password-reset"
                onClick={e => {
                  e.preventDefault();
                  onNavigateToRequestPasswordReset();
                }}
              >
                Click here to request a new password reset link
              </Link>
              {/* eslint-enable */}
            </FormErrorMessage>
          )}
          <Text>Click the button below to set a new password.</Text>
          <PrimaryButton fullWidth onClick={submitForm} disabled={!!oneTimeLoginFailedMessage}>
            Reset Password Now
          </PrimaryButton>
        </>
      )}
    />
  </Container>
);

ResetPasswordOneTimeLoginFormComponent.defaultProps = {
  oneTimeLoginFailedMessage: null,
};

ResetPasswordOneTimeLoginFormComponent.propTypes = {
  isRequestingLogin: PropTypes.bool.isRequired,
  onAttemptOneTimeLogin: PropTypes.func.isRequired,
  oneTimeLoginFailedMessage: PropTypes.string,
  passwordResetToken: PropTypes.string.isRequired,
  onNavigateToRequestPasswordReset: PropTypes.func.isRequired,
};
