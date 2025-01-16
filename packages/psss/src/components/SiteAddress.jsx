import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import * as COLORS from '../constants/colors';

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 1rem 1rem 1.8rem 1.25rem;
`;

const AddressContainer = styled.div`
  flex: 1;
  padding-top: 0.8rem;
  padding-right: 0.8rem;
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
  font-size: 0.875rem;
  line-height: 1.125rem;
  padding-right: 1rem;
`;

const ContactSection = styled.div`
  margin-bottom: 0.2rem;
`;

const ContactHeading = styled(Typography)`
  font-size: 0.8rem;
  line-height: 1.125rem;
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
          <ContactLink component={MuiLink} href={`mailto:${contact.email}`} underline="always">
            {contact.email}
          </ContactLink>
        </ContactSection>
      </AddressContainer>
      <Map>Map</Map>
    </Container>
  );
};

SiteAddress.propTypes = {
  contact: PropTypes.shape({
    name: PropTypes.string,
    department: PropTypes.string,
    email: PropTypes.string,
  }),
  address: PropTypes.shape({
    name: PropTypes.string,
    district: PropTypes.string,
    country: PropTypes.string,
  }),
};

SiteAddress.defaultProps = {
  contact: {},
  address: {},
};
