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
import { WHITE } from '../../styles';

const SuccessMessage = styled.p`
  text-align: center;
  color: ${WHITE};
`;

export const HasTotalAccessMessage = ({ onClose }) => (
  <div>
    <SuccessMessage>You already have access to all available countries</SuccessMessage>
    <PrimaryButton fullWidth onClick={onClose}>
      OK
    </PrimaryButton>
  </div>
);

HasTotalAccessMessage.propTypes = {
  onClose: PropTypes.func.isRequired,
};
