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

const SuccessMessage = styled.p`
  text-align: center;
`;

export const RequestSuccessfulMessage = ({ onClose }) => (
  <div>
    <SuccessMessage>
      Thank you for your country request. We will review your application and respond by email
      shortly
    </SuccessMessage>
    <PrimaryButton fullWidth onClick={onClose}>
      OK
    </PrimaryButton>
  </div>
);

RequestSuccessfulMessage.propTypes = {
  onClose: PropTypes.func.isRequired,
};
