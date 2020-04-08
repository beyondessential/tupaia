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
import { Dashboard, NewReleases, Warning, SystemUpdateAlt } from '@material-ui/icons';
import Box from '@material-ui/core/Box';
import { Button, LightOutlinedButton, ProfileButton } from '../components/Button';
import Typography from '@material-ui/core/Typography';
import { LightBreadcrumbs } from '../components/Breadcrumbs';
import MuiButton from '@material-ui/core/Button';
import MuiButtonGroup from '@material-ui/core/ButtonGroup';
import Avatar from '@material-ui/core/Avatar';

export default {
  title: 'Header',
};

const Header = styled.header`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.7);
  
  img {
    margin-right: 60px;
  }
`;

const HeaderMain = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0 38px;
`;

const Toolbar = styled.div`
  background-color: ${COLORS.DARK_BLUE};
  color: ${COLORS.WHITE};
  padding: 12px 0;
  letter-spacing: 0;

  .MuiButton-root {
    color: #97b7ce;
    font-weight: 500;
    font-size: 18px;
    line-height: 1;
    letter-spacing: 0;
    padding: 9px 32px;
  }
  
  .active {
    color: white;
  }

  .MuiButtonGroup-groupedText:not(:last-child) {
    border-color: #7ea7c3;
  }

  .MuiButtonGroup-groupedText:last-child {
    padding-right: 0;
  }

  .MuiButtonGroup-groupedText:first-child {
    padding-left: 0;
  }
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
          <ProfileButton startIcon={<Avatar>T</Avatar>}>
            Tom
          </ProfileButton>
        </NavBar>
        <HeaderMain>
          <div>
            <LightBreadcrumbs />
            <Typography variant="h1" component="h1">
              American Samoa
            </Typography>
          </div>
          <LightOutlinedButton endIcon={<SystemUpdateAlt />}>Export Data</LightOutlinedButton>
        </HeaderMain>
      </Container>
    </Header>
    <Toolbar>
      <Container maxWidth="lg">
        <MuiButtonGroup variant="text">
          <MuiButton className="active">Weekly Case Data</MuiButton>
          <MuiButton>Event-based Data</MuiButton>
        </MuiButtonGroup>
      </Container>
    </Toolbar>
  </div>
);
