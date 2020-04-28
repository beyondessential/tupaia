/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { TableLayout } from './TableLayout';

const Main = styled.main`
  background: lightgray;
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
`;

const countries = [
  { name: 'Samoa', url: 'samoa' },
  { name: 'Fiji', url: 'fiji' },
  { name: 'Kiribati', url: 'kiribati' },
  { name: 'Tonga', url: 'tonga' },
  { name: 'Tuvalu', url: 'tuvalu' },
  { name: 'Vanuatu', url: 'vanuatu' },
];

export const CountriesLayout = ({ metaData }) => {
  return (
    <Main>
      <Container>
        <h2>Countries Layout</h2>
        <ul>
          {countries.map(country => (
            <li key={country.url}>
              <Link to={`/country/${country.url}`}>{country.name}</Link>
            </li>
          ))}
        </ul>
        <TableLayout metaData={metaData} />
      </Container>
    </Main>
  );
};

CountriesLayout.propTypes = {
  metaData: PropTypes.object.isRequired,
};
