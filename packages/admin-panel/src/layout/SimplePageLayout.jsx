/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Main } from './Page';
import { TopNavbar } from './navigation';

export const SimplePageLayout = ({ children, logo, homeLink }) => {
  return (
    <Main>
      <TopNavbar logo={logo} homeLink={homeLink} />
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
};

SimplePageLayout.defaultProps = {
  children: null,
  logo: undefined,
  homeLink: '/',
};
