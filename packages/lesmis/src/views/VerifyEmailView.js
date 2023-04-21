/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useUrlParams } from '../utils';

export const VerifyEmailView = () => {
  const { locale } = useUrlParams();
  const location = useLocation();

  return <Redirect to={{ ...location, pathname: `/${locale}/login` }} />;
};
