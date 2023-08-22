/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { HomeButton, NavBar as BaseNavBar } from '@tupaia/ui-components';
import { ProfileButton } from '../authentication';

const isTabActive = (match, location) => {
  if (!match) {
    return false;
  }
  return location.pathname.indexOf(match.url) !== -1;
};

const StyledHomeButton = styled(HomeButton)`
  margin-top: 14px;
  margin-bottom: 14px;
`;

const StyledNavBar = styled(BaseNavBar)`
  .mobile {
    display: none;
  }
  @media screen and (max-width: 1300px) {
    .mobile {
      display: block;
      margin-right: 0;
    }
    .desktop {
      display: none;
    }
    .MuiTab-root {
      font-size: 14px;
      margin: 0 0.8rem;
    }
    .MuiSvgIcon-root {
      display: none;
    }
  }
`;

export const Navbar = ({ links, user }) => (
  <StyledNavBar
    HomeButton={
      <>
        <StyledHomeButton source="/admin-panel-logo-white.svg" className="desktop" />
        <StyledHomeButton source="/tupaia.svg" className="mobile" />
      </>
    }
    links={links}
    Profile={() => <ProfileButton user={user} />}
    isTabActive={isTabActive}
    maxWidth="xl"
  />
);

Navbar.propTypes = {
  links: PropTypes.arrayOf(PropTypes.shape({})),
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    profileImage: PropTypes.string,
  }).isRequired,
};

Navbar.defaultProps = {
  links: [],
};
