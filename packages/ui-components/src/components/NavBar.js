/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import MuiContainer from '@material-ui/core/Container';
import { LightTab, LightTabs } from './Tabs';
import { Dashboard, NewReleases, Warning } from '@material-ui/icons';
import { ProfileButton } from './Button';
import Avatar from '@material-ui/core/Avatar';
import styled from 'styled-components';

const Wrapper = styled.nav`
  background-color: ${props => props.theme.palette.primary.main};
`;

const Inner = styled(MuiBox)`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  .MuiTabs-root {
    margin-bottom: -1px; // This is needed to align the indicator with the border
  }
`;

const NavLinks = styled(MuiBox)`
  display: flex;
  justify-content: flex-start;

  img {
    margin-right: 4rem;
  }
`;

export const NavBar = () => (
  <Wrapper>
    <MuiContainer>
      <Inner>
        <NavLinks>
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
        </NavLinks>
        <ProfileButton startIcon={<Avatar>T</Avatar>}>Tom</ProfileButton>
      </Inner>
    </MuiContainer>
  </Wrapper>
);
