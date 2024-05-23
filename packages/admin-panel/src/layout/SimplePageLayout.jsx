/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import { Main } from './Page';
import { TopNavbar } from './navigation';

export const SimplePageLayout = ({ children }) => {
  return (
    <Main>
      <TopNavbar />
      {children || <Outlet />}
    </Main>
  );
};

SimplePageLayout.propTypes = {
  children: PropTypes.node,
};

SimplePageLayout.defaultProps = {
  children: null,
};
