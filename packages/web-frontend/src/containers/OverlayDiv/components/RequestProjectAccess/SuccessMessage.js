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
import { WHITE, GREY } from '../../../../styles';
import { OVERLAY_PADDING } from '../../constants';

const BackButton = styled(PrimaryButton)`
  width: 100%;
  padding: 5px 10px;
`;

const MessageHeader = styled.p`
  text-align: center;
  color: ${WHITE};
  max-width: 300px;
  font-size: larger;
`;

const Message = styled.p`
  text-align: center;
  color: ${WHITE};
  max-width: 300px;
`;

const Note = styled.p`
  text-align: center;
  color: ${GREY};
  max-width: 300px;
  font-size: small;
  padding: 10px;
`;

const Container = styled.div`
  padding: ${OVERLAY_PADDING};
`;

export const SuccessMessage = ({ projectName, handleClose }) => (
  <Container>
    <MessageHeader>
      Thank you for requesting access to <strong>{projectName}</strong>.
    </MessageHeader>
    <Message>We will review your application and respond by email shortly.</Message>
    <Note>
      Note: This can take some time to process, as requests require formal permission to be granted.
    </Note>
    <BackButton onClick={handleClose}>Back to projects</BackButton>
  </Container>
);

SuccessMessage.propTypes = {
  projectName: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
};
