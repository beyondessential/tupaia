/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import MuiContainer from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import styled from 'styled-components';
import { SystemUpdateAlt } from '@material-ui/icons';
import {
  NavBar,
  HomeButton,
  LightProfileButton,
  Dashboard,
  WarningCloud,
  LightOutlinedButton,
} from '@tupaia/ui-components';
import { TabsToolbar } from './Toolbar';
import * as COLORS from '../theme/colors';

const Profile = () => <LightProfileButton startIcon={<Avatar>T</Avatar>}>Tom</LightProfileButton>;

const links = [
  {
    label: 'Weekly Reports',
    to: '/',
    icon: <Dashboard />,
  },
  {
    label: 'Alerts & Outbreaks',
    to: '/alerts',
    icon: <WarningCloud />,
  },
];

const Home = () => <HomeButton source="/psss-logo-white.svg" />;

const HeaderMain = styled.header`
  background-color: ${COLORS.BLUE};
  color: ${COLORS.WHITE};
`;

const HeaderInner = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 55px 0 65px;
`;

export const Header = () => (
  <div>
    <NavBar HomeButton={Home} links={links} Profile={Profile} />
    <HeaderMain>
      <MuiContainer maxWidth="lg">
        <HeaderInner>
          <div>
            <Typography variant="h1" component="h1">
              Countries
            </Typography>
          </div>
          <LightOutlinedButton startIcon={<SystemUpdateAlt />}>Export Data</LightOutlinedButton>
        </HeaderInner>
      </MuiContainer>
    </HeaderMain>
  </div>
);
