/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Route } from 'react-router-dom';
import { NotAuthorisedView } from '../views/NotAuthorisedView';

export const LesmisAdminRoute = ({ isBESAdmin = false, ...props }) => {
  if (!isBESAdmin) {
    return <NotAuthorisedView />;
  }

  return <Route {...props} />;
};
