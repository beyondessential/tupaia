/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Header } from '../containers/Header';
import { Toolbar } from '../components/Toolbar';
import { RouterProvider } from '../RouterProvider';

export default {
  title: 'Header',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

export const header = () => <Header Toolbar={<Toolbar />} />;
