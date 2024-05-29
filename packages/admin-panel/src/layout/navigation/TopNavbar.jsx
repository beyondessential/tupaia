/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { UserLink } from './UserLink';
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
  ${UserLink} {
    font-size: 0.875rem;
  }
  img {
    height: 2rem;
  }
`;

export const TopNavbar = ({ logo, homeLink }) => {
  const { isLoggedIn } = useUser();
  const { mutate: logout } = useLogout();
  return (
    <Wrapper>
      <HomeLink logo={logo} homeLink={homeLink} />
      {isLoggedIn && <UserLink onClick={logout}>Logout</UserLink>}
    </Wrapper>
  );
};

TopNavbar.propTypes = {
  logo: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }),
  homeLink: PropTypes.string,
};

TopNavbar.defaultProps = {
  logo: {
    url: '/admin-panel-logo-white.svg',
    alt: 'Tupaia Admin Panel Logo',
  },
  homeLink: '/',
};
