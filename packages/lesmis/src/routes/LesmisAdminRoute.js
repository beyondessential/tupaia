/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Route } from 'react-router-dom';
import { useUser } from '../api/queries';
import { FullPageLoader } from '../components';
import { NotAuthorisedView } from '../views/NotAuthorisedView';

export const LesmisAdminRoute = props => {
  const { isLoading: isUserLoading, isLesmisAdmin } = useUser();
  if (isUserLoading) {
    return <FullPageLoader />;
  }

  if (!isLesmisAdmin) {
    return <NotAuthorisedView />;
  }

  return <Route {...props} />;
};
