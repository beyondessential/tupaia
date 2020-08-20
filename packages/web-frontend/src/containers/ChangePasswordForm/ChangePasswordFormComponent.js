/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Component for Change Password Form
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { isMobile } from '../../utils';
import { FormWrapper } from '../../components/FormWrapper';
import { PrimaryButton } from '../../components/Buttons';
import { WHITE } from '../../styles';

import { Form } from '../Form';
import { TextField } from '../Form/Fields';
import { passwordLength, passwordMatch } from '../Form/validators';

const SuccessMessage = styled.p`
  text-align: center;
  color: ${isMobile() && WHITE};
`;

export const ChangePasswordFormComponent = ({
  isRequestingChangePassword,
  changePasswordFailedMessage,
  hasChangePasswordCompleted,
  onAttemptChangePassword,
  onClose,
  useResetToken,
  passwordResetToken,
}) => {
  const titleText = 'Change Password';

  if (hasChangePasswordCompleted) {
    return (
      <FormWrapper titleText={titleText} onClose={onClose}>
        <SuccessMessage>You have successfully changed your password</SuccessMessage>
        <PrimaryButton fullWidth onClick={onClose}>
          OK
        </PrimaryButton>
      </FormWrapper>
    );
  }

  return (
    <Form
      isLoading={isRequestingChangePassword}
      formError={changePasswordFailedMessage}
      onSubmit={fieldValues => onAttemptChangePassword(fieldValues)}
      render={submitForm => (
        <>
          {useResetToken ? (
            <TextField name="passwordResetToken" hidden defaultValue={passwordResetToken} />
          ) : (
            <TextField
              fullWidth
              label="Current password"
              name="oldPassword"
              type="password"
              required
            />
          )}
          <TextField
            fullWidth
            label="New password"
            name="password"
            type="password"
            required
            validators={[passwordLength]}
          />
          <TextField
            fullWidth
            label="Confirm new password"
            name="passwordConfirm"
            type="password"
            required
            validators={[passwordLength, passwordMatch]}
          />
          <PrimaryButton onClick={submitForm} fullWidth>
            Change password
          </PrimaryButton>
        </>
      )}
    />
  );
};

ChangePasswordFormComponent.propTypes = {
  isRequestingChangePassword: PropTypes.bool.isRequired,
  changePasswordFailedMessage: PropTypes.string.isRequired,
  hasChangePasswordCompleted: PropTypes.bool.isRequired,
  onAttemptChangePassword: PropTypes.func.isRequired,
  useResetToken: PropTypes.bool,
  passwordResetToken: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

ChangePasswordFormComponent.defaultProps = {
  useResetToken: false,
  passwordResetToken: '',
};
