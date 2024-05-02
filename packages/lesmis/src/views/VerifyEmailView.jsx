/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUrlParams } from '../utils';

export const VerifyEmailView = () => {
  const { locale } = useUrlParams();
  const location = useLocation();

  return <Navigate to={{ ...location, pathname: `/${locale}/login` }} />;
};
