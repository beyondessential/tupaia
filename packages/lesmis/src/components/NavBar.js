/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { HomeButton } from '@tupaia/ui-components';
import { FlexSpaceBetween, FlexStart } from './Layout';
import { ProfileButton } from './ProfileButton';
import { MainMenu } from './MainMenu';
import { FavouritesMenu } from './FavouritesMenu';
import { SearchBar } from './SearchBar';
import { NAVBAR_HEIGHT } from '../constants';

/**
 * === PLACEHOLDER NAVIGATION ===
 *
 * Waiting for designs to be completed. @see https://github.com/beyondessential/tupaia-backlog/issues/2234
 *
 * ================================
 */

const Container = styled.nav`
  background-color: ${props => props.theme.palette.primary.main};

  img {
    position: relative;
    top: -1px;
    height: 53px;
  }
`;

const Inner = styled(FlexSpaceBetween)`
  height: ${NAVBAR_HEIGHT};
`;

const Left = styled(FlexStart)`
  height: 100%;
`;

const Right = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const NavBar = () => (
  <Container>
    <MuiContainer maxWidth="lg">
      <Inner>
        <Left>
          <MainMenu />
          <HomeButton homeUrl="/" source="/lesmis-logo-white.svg" />
        </Left>
        <SearchBar />
        <Right>
          <FavouritesMenu />
          <ProfileButton />
        </Right>
      </Inner>
    </MuiContainer>
  </Container>
);
