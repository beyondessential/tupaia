/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation } from 'react-router-dom';
import { LandingPage, Project } from '.';

export const Base = () => {
  const location = useLocation();

  const finalURLChar = location.pathname[location.pathname.length - 1];
  const isLandingPage =
    location.pathname.split('/').length - 1 - (finalURLChar === '/' ? 1 : 0) === 1;

  return isLandingPage ? <LandingPage /> : <Project />;
};
