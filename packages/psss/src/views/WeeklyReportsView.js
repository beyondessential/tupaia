/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { BaseToolbar } from '@tupaia/ui-components';
import Typography from '@material-ui/core/Typography';
import { Header } from '../components/Header';
import { TableView } from './TableView';
import { Container, Main, Sidebar } from '../components';

const countries = [
  { name: 'Samoa', url: 'samoa' },
  { name: 'Fiji', url: 'fiji' },
  { name: 'Kiribati', url: 'kiribati' },
  { name: 'Tonga', url: 'tonga' },
  { name: 'Tuvalu', url: 'tuvalu' },
  { name: 'Vanuatu', url: 'vanuatu' },
];

const config = {
  resource: 'base-url/resources/home-page',
};

export const WeeklyReportsView = () => {
  return (
    <React.Fragment>
      <Header title="All Countries" />
      <BaseToolbar />
      <Container>
        <Main>
          <ul>
            {countries.map(country => (
              <li key={country.url}>
                <Link to={`weekly-reports/${country.url}`}>{country.name}</Link>
              </li>
            ))}
          </ul>
          <TableView config={config} />
        </Main>
        <Sidebar>
          <Typography variant="h2" gutterBottom>
            Sidebar
          </Typography>
          <Typography variant="body1" gutterBottom>
            Home Page
          </Typography>
        </Sidebar>
      </Container>
    </React.Fragment>
  );
};
