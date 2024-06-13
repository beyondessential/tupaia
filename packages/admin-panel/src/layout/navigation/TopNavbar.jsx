/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { UserButton } from './UserButton';
import { HomeLink } from './HomeLink';
import { useUser } from '../../api/queries';
import { useLogout } from '../../api/mutations';

const Wrapper = styled.div`
  background-color: ${props => props.theme.palette.secondary.main};
  padding-block: 1rem;
  padding-inline: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  ${UserButton} {
    font-size: 0.875rem;
  }
  img {
    height: 2rem;
  }
`;

export const TopNavbar = ({ logo, homeLink, displayLogoutButton, disableHomeLink }) => {
  const { isLoggedIn } = useUser();
  const { mutate: logout } = useLogout();
  return (
    <Wrapper>
      <HomeLink logo={logo} homeLink={homeLink} disableHomeLink={disableHomeLink} />
      {isLoggedIn && displayLogoutButton && <UserButton onClick={logout}>Logout</UserButton>}
    </Wrapper>
  );
};

TopNavbar.propTypes = {
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
  homeLink: PropTypes.string,
  displayLogoutButton: PropTypes.bool,
  disableHomeLink: PropTypes.bool,
};

TopNavbar.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
  displayLogoutButton: true,
  disableHomeLink: false,
};
