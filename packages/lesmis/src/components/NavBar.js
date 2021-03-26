/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import MuiContainer from '@material-ui/core/Container';
import MuiButton from '@material-ui/core/Button';
import { HomeButton } from '@tupaia/ui-components';
import { FlexSpaceBetween, FlexStart } from './Layout';
import { ProfileButton } from './ProfileButton';
import { MainMenu } from './MainMenu';
import { FavouritesMenu } from './FavouritesMenu';
import { SearchBar } from './SearchBar';
import { NAVBAR_HEIGHT } from '../constants';
import { useUser } from '../api/queries';
import { useUrlParams } from '../utils';

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

const TextButton = styled(MuiButton)`
  margin-right: 10px;
  color: white;
`;

const Search = styled(SearchBar)`
  @media screen and (max-width: 900px) {
    display: none;
  }
`;

export const NavBar = () => {
  const { isLoggedIn } = useUser();
  const { view } = useUrlParams();
  const { pathname } = useLocation();

  return (
    <Container>
      <MuiContainer maxWidth={false}>
        <Inner>
          <Left>
            <MainMenu />
            <StyledHomeButton homeUrl="/" source="/lesmis-logo-white.svg" />
          </Left>
          {pathname !== '/' && <Search linkType={view} />}
          <FlexStart>
            {isLoggedIn ? (
              <FavouritesMenu />
            ) : (
              <TextButton href="https://tupaia.org" target="_blank">
                Sign up
              </TextButton>
            )}
            <ProfileButton />
          </FlexStart>
        </Inner>
      </MuiContainer>
    </Container>
  );
};
