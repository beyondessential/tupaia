/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import InfoIcon from '@material-ui/icons/Info';

import { Form } from '../Form';
import { TextField, CheckboxField } from '../Form/Fields';
import { FormLink } from '../Form/common';
import { passwordLength, passwordMatch, emailAddress, hasNoAlphaLetters } from '../Form/validators';
import { WHITE } from '../../styles/index';
import { SubmitButton } from '../Form/common/SubmitButton';

const LearnMore = styled.div`
  font-size: 14px;
  text-align: left;
  display: flex;
  align-items: center;

  a {
    color: ${WHITE};
  }

  svg {
    vertical-align: bottom;
    width: 18px;
    height: 18px;
    padding-right: 4px;
  }
`;

const TermsAndConditions = styled.div`
  color: ${WHITE};
`;

const TermsLink = styled(FormLink)`
  text-decoration: underline;
  font-size: 14px;
`;

const TermsLabel = () => (
  <TermsAndConditions>
    I agree to the&nbsp;
    <TermsLink
      href="https://info.tupaia.org/terms-and-privacy/"
      target="_blank"
      rel="noreferrer noopener"
    >
      terms and conditions
    </TermsLink>
  </TermsAndConditions>
);

export const SignupFormComponent = ({
  isRequestingSignup,
  signupFailedMessage,
  onAttemptUserSignup,
}) => (
  <Form
    isLoading={isRequestingSignup}
    formError={signupFailedMessage}
    onSubmit={fieldValues => onAttemptUserSignup(fieldValues)}
    render={submitForm => (
      <>
        <TextField label="First Name" name="firstName" required />
        <TextField label="Last Name" name="lastName" required />
        <TextField label="E-mail" name="emailAddress" validators={[emailAddress]} required />
        <TextField label="Contact Number" name="contactNumber" validators={[hasNoAlphaLetters]} />
        <TextField
          label="Password"
          name="password"
          type="password"
          validators={[passwordLength]}
          required
        />
        <TextField
          label="Confirm Password"
          name="passwordConfirm"
          type="password"
          validators={[passwordLength, passwordMatch]}
          required
        />
        <TextField label="Employer" name="employer" required />
        <TextField label="Position" name="position" required />
        <CheckboxField fullWidth label={<TermsLabel />} name="hasAgreed" required />
        <LearnMore>
          <InfoIcon />
          Visit&nbsp;
          <a rel="noopener noreferrer" target="_blank" href="https://info.tupaia.org/">
            info.tupaia.org
          </a>
          &nbsp;to learn more
        </LearnMore>
        <SubmitButton text="Create account" handleClick={submitForm} />
      </>
    )}
  />
);

SignupFormComponent.propTypes = {
  isRequestingSignup: PropTypes.bool.isRequired,
  signupFailedMessage: PropTypes.string,
  onAttemptUserSignup: PropTypes.func.isRequired,
};

SignupFormComponent.defaultProps = {
  signupFailedMessage: null,
};
