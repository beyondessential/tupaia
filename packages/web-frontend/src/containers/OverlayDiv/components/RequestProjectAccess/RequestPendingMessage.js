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
import { RequestedProjectCountryAccessList } from './RequestedProjectCountryAccessList';

const BackButton = styled(PrimaryButton)`
  width: auto;
  padding: 5px 15px;
`;

const MessageHeader = styled.p`
  text-align: left;
  color: ${WHITE};
  max-width: 430px;
  font-size: larger;
`;

const Message = styled.p`
  text-align: left;
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

export const RequestPendingMessage = ({
  project,
  requestedCountries,
  availableCountries,
  handleClose,
  handleRequest,
}) => (
  <Container>
    <MessageHeader>
      Requesting access for <strong>{project.name}</strong>
    </MessageHeader>
    <Message>
      <b>You have already requested access to this project</b>
    </Message>
    <RequestedProjectCountryAccessList
      requestedCountries={requestedCountries}
      availableCountries={availableCountries}
      handleRequest={handleRequest}
    />
    <Message>
      This can take some time to process, as requests require formal permission to be granted.
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
  project: PropTypes.shape({
    name: PropTypes.string,
    code: PropTypes.string,
  }).isRequired,
  requestedCountries: PropTypes.arrayOf(PropTypes.object).isRequired,
  availableCountries: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleClose: PropTypes.func.isRequired,
  handleRequest: PropTypes.func.isRequired,
};
