/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation } from 'react-router-dom';
import { LandingPage, Project } from '.';

export const Base = () => {
  const { pathname } = useLocation();

  // This is to handle trailing '/' in a pathname
  const finalURLChar = pathname[pathname.length - 1];
  const finalCharSubtractor = finalURLChar === '/' ? 1 : 0;

  // If a pathname has only 1 segment, treat as a landing page, otherwise treat as a project
  const isLandingPage = pathname.split('/').length - 1 - finalCharSubtractor === 1;

  return isLandingPage ? <LandingPage /> : <Project />;
};
