/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
// import { Header } from '../components/Header';
import Container from '@material-ui/core/Container';
import * as COLORS from '../theme/colors';
import styled from 'styled-components';
import { LightTab, LightTabs } from '../components/Tabs';
import { Dashboard, NewReleases, Warning } from '@material-ui/icons';
import Box from '@material-ui/core/Box';
import { Button, LightOutlinedButton } from '../components/Button';
import Typography from '@material-ui/core/Typography';
import { LightBreadcrumbs } from '../components/Breadcrumbs';

export default {
  title: 'Header',
};

const Header = styled.header`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
  padding: 1rem;
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
`;

const HeaderMain = styled.nav`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
`;

const Toolbar = styled.div`
  background-color: ${COLORS.DARK_BLUE};
  color: ${COLORS.WHITE};
  padding: 1rem;
`;

export const header = () => (
  <div>
    <Header>
      <Container maxWidth="lg">
        <NavBar>
          <Box display="flex">
            <img src="/psss-logo.svg" alt="psss logo" />
            <LightTabs>
              <LightTab>
                <Dashboard />
                Dashboard
              </LightTab>
              <LightTab>
                <Warning />
                Alerts
              </LightTab>
              <LightTab>
                <NewReleases />
                Outbreaks
              </LightTab>
            </LightTabs>
          </Box>
          <div>
            <p>Catherine</p>
          </div>
        </NavBar>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" py={3} my={3}>
          <div>
            <LightBreadcrumbs />
            <Typography variant="h3" component="h1">
              All Countries
            </Typography>
          </div>
          <LightOutlinedButton>Export</LightOutlinedButton>
        </Box>
      </Container>
    </Header>
    <Toolbar>
      <Container maxWidth="lg">
        <nav>Week 10...</nav>
      </Container>
    </Toolbar>
  </div>
);
