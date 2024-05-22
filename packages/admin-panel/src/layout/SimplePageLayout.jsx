/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Main } from './Page';
import { TopNavbar } from './navigation';

export const SimplePageLayout = () => {
  return (
    <Main>
      <TopNavbar />
      <Outlet />
    </Main>
  );
};
