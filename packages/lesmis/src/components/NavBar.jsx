import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiContainer from '@material-ui/core/Container';
import { HomeButton } from '@tupaia/ui-components';
import { FlexSpaceBetween, FlexStart } from './Layout';
import { ProfileButton } from './ProfileButton';
import { MainMenu } from './MainMenu';
import { SearchBar } from './SearchBar';
import { NAVBAR_HEIGHT } from '../constants';
import { useUser } from '../api';
import { useUrlParams, useHomeUrl } from '../utils';
import { SignUpLink } from './SignUpLink';

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

const Search = styled(SearchBar)`
  @media screen and (max-width: 900px) {
    display: none;
  }
`;

export const NavBar = ({ hideSearch }) => {
  const { isLoggedIn } = useUser();
  const { view } = useUrlParams();
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
              <SignUpLink />
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
