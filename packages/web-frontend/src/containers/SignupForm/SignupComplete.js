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
import { FormLink } from '../Form/common';

const Container = styled.div`
  margin: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    margin-top: 20px;
    width: 50%;
  }
`;

export const SignupComplete = ({ onClickResend }) => (
  <Container>
    <div>
      Congratulations, you have successfully signed up to Tupaia. To activate your account please{' '}
      <b>click the verification link in your email.</b> Once activated, you can use your new account
      to log in to tupaia.org as well as our app, Tupaia Meditrak on{' '}
      <FormLink
        href="https://itunes.apple.com/us/app/tupaia-meditrak/id1245053537?mt=8"
        target="_blank"
        rel="noopener noreferrer"
      >
        &nbsp;iOS
      </FormLink>
      &nbsp;and
      <FormLink
        href="https://play.google.com/store/apps/details?id=com.tupaiameditrak&hl=en"
        target="_blank"
        rel="noopener noreferrer"
      >
        &nbsp;Android&nbsp;.
      </FormLink>
    </div>
    <PrimaryButton onClick={onClickResend}>Re-send verification email</PrimaryButton>
  </Container>
);

SignupComplete.propTypes = {
  onClickResend: PropTypes.func.isRequired,
};
