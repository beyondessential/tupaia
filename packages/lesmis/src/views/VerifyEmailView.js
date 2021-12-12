/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useUrlParams } from '../utils';
import { Redirect, useLocation } from 'react-router-dom';

export const VerifyEmailView = () => {
  const { locale } = useUrlParams();
  const location = useLocation();

  return <Redirect to={{ ...location, pathname: `/${locale}/login` }} />;
};
