/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PrimaryButton } from '../../../../components/Buttons';
import { OVERLAY_PADDING } from '../../constants';
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

const Container = styled.div`
  padding: ${OVERLAY_PADDING};
`;

const styles = {
  contactLink: {
    display: 'inline-block',
    padding: '5px 0',
    textDecoration: 'underline',
    color: WHITE,
  },
};

export const RequestPendingMessage = ({ projectName, handleClose }) => (
  <Container>
    <Message>
      {`Requesting access for `}
      <b>{projectName}</b>
    </Message>
    <Message>
      {`You have already requested access to this project and this can take some time to process,
            as requests require formal permission to be granted.`}
    </Message>
    <Message>
      {`If you have any questions, please email: `}
      <a style={styles.contactLink} href="mailto:admin@tupaia.org">
        admin@tupaia.org
      </a>
    </Message>
    <BackButton onClick={handleClose}>Back to projects</BackButton>
  </Container>
);

RequestPendingMessage.propTypes = {
  projectName: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
};
