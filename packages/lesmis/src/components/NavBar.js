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

const Container = styled.nav`
  position: relative;
  background-color: ${props => props.theme.palette.primary.main};
  z-index: 10;
`;

const Inner = styled(FlexSpaceBetween)`
  height: ${NAVBAR_HEIGHT};
`;

const StyledHomeButton = styled(HomeButton)`
  position: relative;
  top: -1px;
  height: 53px;
`;

const Left = styled(FlexStart)`
  height: 100%;
`;

export const NavBar = () => (
  <Container>
    <MuiContainer maxWidth={false}>
      <Inner>
        <Left>
          <MainMenu />
          <StyledHomeButton homeUrl="/" source="/lesmis-logo-white.svg" />
        </Left>
        <SearchBar />
        <FlexStart>
          <FavouritesMenu />
          <ProfileButton />
        </FlexStart>
      </Inner>
    </MuiContainer>
  </Container>
);
