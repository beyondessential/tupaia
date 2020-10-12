/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PrimaryButton } from '../../../../components/Buttons';

const BackButton = styled(PrimaryButton)`
  width: auto;
  padding: 5px 15px;
`;

const HasRequestedCountriesMessage = styled.div`
  text-align: center;
  display: 'block';
`;
const RequestedProjectCountriesList = styled.div`
  text-align: center;
  margin: 10px;
`;

const styles = {
  contactLink: {
    display: 'inline-block',
    padding: '5px 0',
    textDecoration: 'underline',
    color: 'white',
  },
  list: {
    padding: 0,
    margin: 10,
    listStyleType: 'none',
    textAlign: 'center',
    fontWeight: 'bold',
  },
};

export const RequestedProjectCountryAccessList = ({ countries, handleClose }) => {
  if (!countries.length) return null;

  return (
    <div>
      <HasRequestedCountriesMessage>
        You have already requested access to the following countries and this can take some time to
        process, as requests require formal permission to be granted.
      </HasRequestedCountriesMessage>
      <RequestedProjectCountriesList>
        <ul style={styles.list}>
          {countries.map(country => (
            <li key={`requestedProjectCountry${country.name}`}>{country.name}</li>
          ))}
        </ul>
      </RequestedProjectCountriesList>
      <HasRequestedCountriesMessage>
        This can take some time to process, as requests require formal permission to be granted. If
        you have any questions, please email:{' '}
        <a style={styles.contactLink} href="mailto:admin@tupaia.org">
          admin@tupaia.org
        </a>
      </HasRequestedCountriesMessage>
      <BackButton onClick={handleClose}>Back to projects</BackButton>
    </div>
  );
};

RequestedProjectCountryAccessList.propTypes = {
  countries: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleClose: PropTypes.func.isRequired,
};
