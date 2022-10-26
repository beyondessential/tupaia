/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useUser } from '../api/queries';

export const AdminRoute = props => {
  const { isLoading, isSuccess } = useUser();
  if (isLoading) {
    return 'Loading';
  }

  if (!isSuccess) {
    return <Redirect to="/login" />;
  }

  return <Route {...props} />;
};
