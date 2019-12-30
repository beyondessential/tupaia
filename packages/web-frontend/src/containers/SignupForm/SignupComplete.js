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

  button {
    margin-top: 20px;
    width: 50%;
  }
`;

export const SignupComplete = ({ ref, onClickLogin }) => (
  <Container ref={ref}>
    <div>
      Congratulations, you have successfully created an account for Tupaia! You can use your new
      account to sign in to Tupaia, as well as our app, Tupaia Meditrak, on
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
        &nbsp;Android&nbsp;
      </FormLink>
    </div>
    <PrimaryButton onClick={onClickLogin}>Sign In</PrimaryButton>
  </Container>
);

SignupComplete.propTypes = {
  onClickLogin: PropTypes.func.isRequired,
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })])
    .isRequired,
};
