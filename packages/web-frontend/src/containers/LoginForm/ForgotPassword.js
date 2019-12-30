/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { WHITE } from '../../styles';

const ForgotPasswordLink = styled.a`
  color: ${WHITE};
  font-weight: 400;
  text-decoration: none;
  font-size: 12px;
  align-self: center;
  text-align: left;
`;

export const ForgotPassword = ({ handleClick }) => {
  return (
    <ForgotPasswordLink
      href="#reset-password"
      onClick={e => {
        e.preventDefault();
        handleClick();
      }}
    >
      Forgot your password?
    </ForgotPasswordLink>
  );
};

ForgotPassword.propTypes = {
  handleClick: PropTypes.func.isRequired,
};
