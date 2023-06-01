/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useParams } from 'react-router-dom';

export const LandingPage = () => {
  const { code } = useParams();
  // use the code to query for the landing page.
  // If found, render landing page. If not, render a default landing page
  return <div>{code}</div>;
};
