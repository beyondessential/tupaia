import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Main } from './Page';
import { TopNavbar } from './navigation';

export const SimplePageLayout = ({
  children,
  logo,
  homeLink,
  displayLogoutButton,
  disableHomeLink,
}) => {
  return (
    <Main>
      <TopNavbar
        logo={logo}
        homeLink={homeLink}
        displayLogoutButton={displayLogoutButton}
        disableHomeLink={disableHomeLink}
      />
      {children || <Outlet />}
    </Main>
  );
};

SimplePageLayout.propTypes = {
  children: PropTypes.node,
  logo: PropTypes.shape({
    url: PropTypes.string,
    alt: PropTypes.string,
  }),
  homeLink: PropTypes.string,
  displayLogoutButton: PropTypes.bool,
  disableHomeLink: PropTypes.bool,
};

SimplePageLayout.defaultProps = {
  children: null,
  logo: undefined,
  homeLink: '/',
  displayLogoutButton: true,
  disableHomeLink: false,
};
