/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import * as COLORS from '../theme/colors';

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 15px 15px 30px 20px;
`;

const AddressContainer = styled.div`
  flex: 1;
  padding-top: 0.8rem;
`;

const Map = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  background: #efefef;
  height: 170px;
  width: 210px;
`;

const AddressSection = styled.div`
  margin-bottom: 0.8rem;
`;

const AddressHeading = styled(Typography)`
  margin-bottom: 0.5rem;
`;

const AddressContent = styled(Typography)`
  color: ${COLORS.TEXT_MIDGREY};
  font-size: 14px;
  line-height: 18px;
  padding-right: 1rem;
`;

const ContactSection = styled.div`
  margin-bottom: 0.2rem;
`;

const ContactHeading = styled(Typography)`
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
`;

const ContactText = styled(ContactHeading)`
  color: ${COLORS.TEXT_MIDGREY};
`;

const ContactLink = styled(ContactHeading)`
  text-decoration: underline;
`;

export const SiteAddress = ({ address, contact }) => {
  return (
    <Container>
      <AddressContainer>
        <AddressSection>
          <AddressHeading variant="h6">{address.name}</AddressHeading>
          <AddressContent>{address.district}</AddressContent>
          <AddressContent>{address.country}</AddressContent>
        </AddressSection>
        <ContactSection>
          <ContactHeading>{contact.name}</ContactHeading>
          <ContactText>{contact.department}</ContactText>
          <ContactLink component={MuiLink} href={`mailto:${contact.email}`}>
            {contact.email}
          </ContactLink>
        </ContactSection>
      </AddressContainer>
      <Map>Map</Map>
    </Container>
  );
};

SiteAddress.propTypes = {
  address: PropTypes.object.isRequired,
  contact: PropTypes.object.isRequired,
};
