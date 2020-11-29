/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const HasRequestedCountriesMessage = styled.div`
  text-align: center;
  display: 'block';
`;
const HasRequestedCountriesList = styled.div`
  text-align: center;
  margin: 10px;
`;

const styles = {
  contactLink: {
    display: 'inline-block',
    padding: '5px 0',
    textDecoration: 'underline',
    color: 'black',
  },
  list: {
    padding: 0,
    margin: 10,
    listStyleType: 'none',
    textAlign: 'center',
    fontWeight: 'bold',
  },
};

export const RequestedCountryAccessList = ({ countries }) => {
  if (!countries.length) return null;

  return (
    <div>
      <HasRequestedCountriesMessage>
        You have already requested access to the following countries:
      </HasRequestedCountriesMessage>
      <HasRequestedCountriesList>
        <ul style={styles.list}>
          {countries.map(country => (
            <li key={`requestedCountry${country.name}`}>{country.name}</li>
          ))}
        </ul>
      </HasRequestedCountriesList>
      <HasRequestedCountriesMessage>
        This can take some time to process, as requests require formal permission to be granted. If
        you have any questions, please email:{' '}
        <a style={styles.contactLink} href="mailto:admin@tupaia.org">
          admin@tupaia.org
        </a>
      </HasRequestedCountriesMessage>
    </div>
  );
};

RequestedCountryAccessList.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.object).isRequired,
};
