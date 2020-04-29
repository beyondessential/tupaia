/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { BaseToolbar } from '@tupaia/ui-components';
import { Header } from '../components/Header';
import { TableView } from './TableView';

const Main = styled.main`
  background: lightgreen;
  height: 800px;
`;

const SideBar = styled.main`
  background: lightblue;
  height: 800px;
`;

const Container = styled(MuiContainer)`
  min-height: 800px;
  padding-top: 1rem;
`;

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
      <MuiContainer>
        <Grid container maxWidth="sm" spacing={3}>
          <Grid item xs={8}>
            <Main />
          </Grid>
          <Grid item xs={4}>
            <SideBar />
          </Grid>
        </Grid>
      </MuiContainer>
      {/*<Container>*/}
      {/*  <Typography variant="h2" gutterBottom>*/}
      {/*    Countries Layout*/}
      {/*  </Typography>*/}
      {/*  <ul>*/}
      {/*    {countries.map(country => (*/}
      {/*      <li key={country.url}>*/}
      {/*        <Link to={`weekly-reports/${country.url}`}>{country.name}</Link>*/}
      {/*      </li>*/}
      {/*    ))}*/}
      {/*  </ul>*/}
      {/*  <TableView config={config} />*/}
      {/*</Container>*/}
    </React.Fragment>
  );
};
