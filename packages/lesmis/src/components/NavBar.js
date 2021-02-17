/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import { LightIconButton, HomeButton } from '@tupaia/ui-components';
import MenuIcon from '@material-ui/icons/Menu';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import { FlexSpaceBetween } from './Layout';
import { ProfileButton } from './ProfileButton';
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
    height: 50px;
  }
`;

const Inner = styled(FlexSpaceBetween)`
  height: ${NAVBAR_HEIGHT};
`;

const Left = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Center = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Right = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SearchBar = styled.div`
  height: 45px;
  overflow: hidden;
  background: white;

  width: 390px;
  background: #ffffff;
  border-radius: 43px;
`;

export const NavBar = () => (
  <Container>
    <MuiContainer>
      <Inner>
        <Left>
          <LightIconButton>
            <MenuIcon />
          </LightIconButton>
          <HomeButton homeUrl="/" source="/lesmis-logo-white.svg" />
        </Left>
        <Center>
          <SearchBar />
        </Center>
        <Right>
          <LightIconButton>
            <FavoriteBorderIcon />
          </LightIconButton>
          <ProfileButton />
        </Right>
      </Inner>
    </MuiContainer>
  </Container>
);
