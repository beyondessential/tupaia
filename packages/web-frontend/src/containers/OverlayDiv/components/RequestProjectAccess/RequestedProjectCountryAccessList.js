/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BLUE } from '../../../../styles';

const Container = styled.div`
  text-align: left;
  display: 'block';
`;

const HasRequestedCountriesMessage = styled.div`
  text-align: left;
  display: 'block';
`;
const RequestedProjectCountriesList = styled.div`
  text-align: left;
  margin-left: 16px;
`;

const RequestLink = styled.a`
  color: ${BLUE};
  white-space: nowrap;
  outline: none;
  text-decoration: underline;
  text-align: left;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
`;

const styles = {
  list: {
    padding: 0,
    marginBottom: '10px',
    marginTop: 0,
    textAlign: 'left',
  },
};

export const RequestedProjectCountryAccessList = ({
  requestedCountries,
  availableCountries,
  handleRequest,
}) => {
  if (!availableCountries.length || !requestedCountries) return null;

  return (
    <Container>
      <HasRequestedCountriesMessage>
        Countries requested for this project:
      </HasRequestedCountriesMessage>
      <RequestedProjectCountriesList>
        <ul style={styles.list}>
          {requestedCountries.map(country => (
            <li key={`requestedProjectCountry${country.name}`}>{country.name}</li>
          ))}
        </ul>
      </RequestedProjectCountriesList>
      <RequestLink onClick={handleRequest}>Request other countries</RequestLink>
    </Container>
  );
};

RequestedProjectCountryAccessList.propTypes = {
  requestedCountries: PropTypes.arrayOf(PropTypes.object).isRequired,
  availableCountries: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleRequest: PropTypes.func.isRequired,
};
