/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PrimaryButton } from '../../../../components/Buttons';
import { WHITE } from '../../../../styles';

const BackButton = styled(PrimaryButton)`
  width: auto;
  padding: 5px 15px;
`;

const Message = styled.p`
  text-align: center;
  color: ${WHITE};
  max-width: 430px;
`;

export const SuccessMessage = ({ projectName, handleClose }) => (
  <div>
    <Message>
      {`
        Thank you for your access request to ${projectName}.
        We will review your application and respond by email shortly.
      `}
    </Message>
    <BackButton onClick={handleClose}>Back to projects</BackButton>
  </div>
);

SuccessMessage.propTypes = {
  projectName: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
};
