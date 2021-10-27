/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import MuiContainer from '@material-ui/core/Container';
import MuiButton from '@material-ui/core/Button';
import { HomeButton } from '@tupaia/ui-components';
import { FlexSpaceBetween, FlexStart } from './Layout';
import { ProfileButton } from './ProfileButton';
import { MainMenu } from './MainMenu';
import { SearchBar } from './SearchBar';
import { NAVBAR_HEIGHT } from '../constants';
import { useUser } from '../api';
import { useUrlParams, useHomeUrl } from '../utils';

const Container = styled.nav`
  position: sticky;
  top: 0;
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

export const NavBar = ({ hideSearch }) => {
  const history = useHistory();
  const { isLoggedIn } = useUser();
  const { locale, view } = useUrlParams();
  const { homeUrl } = useHomeUrl();

  return (
    <Container>
      <MuiContainer maxWidth="xl">
        <Inner>
          <Left>
            <MainMenu />
            <StyledHomeButton homeUrl={homeUrl} source="/lesmis-logo-white.svg" />
          </Left>
          {!hideSearch && <Search linkType={view} />}
          <FlexStart>
            {isLoggedIn ? null : ( // @see https://github.com/beyondessential/tupaia-backlog/issues/2290 //Todo: add Favourites Menu
              <TextButton
                to={{
                  pathname: `/${locale}/register`,
                  state: { referer: history.location },
                }}
                component={RouterLink}
              >
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

NavBar.propTypes = {
  hideSearch: PropTypes.bool,
};

NavBar.defaultProps = {
  hideSearch: false,
};
