/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PrimaryButton } from '../../components/Buttons';
import { Form } from '../Form';
import { WHITE } from '../../styles';
import { isMobile } from '../../utils';

const FullWidth = styled.div`
  text-align: left;
  grid-column: 1 / -1;
`;

let Container = styled.div``;

if (isMobile()) {
  Container = styled.div`
    color: ${WHITE};
  `;
}

export const ResetPasswordOneTimeLoginFormComponent = ({
  isRequestingLogin,
  onAttemptOneTimeLogin,
  oneTimeLoginFailedMessage,
  passwordResetToken,
  onNavigateToRequestPasswordReset,
}) => {
  return (
    <Container>
      <Form
        isLoading={isRequestingLogin}
        onSubmit={() => onAttemptOneTimeLogin(passwordResetToken)}
        formError={oneTimeLoginFailedMessage}
        render={submitForm => (
          <>
            <FullWidth>
              <p>Continue to finish resetting your password</p>
            </FullWidth>
            <FullWidth>
              <PrimaryButton variant="contained" onClick={submitForm}>
                Continue
              </PrimaryButton>
            </FullWidth>
          </>
        )}
      />
      {oneTimeLoginFailedMessage && (
        <p style={{ textAlign: 'center' }}>
          {
            // eslint complains (correctly) that this isn't a real link, it can be changed after #770 implemented
            /* eslint-disable */
          }
          Please <a href="#" onClick={e => { e.preventDefault(); onNavigateToRequestPasswordReset(); }}>request a
          new password reset link</a>
          {
            /* eslint-enable */
          }
        </p>
      )}
    </Container>
  );
};

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
