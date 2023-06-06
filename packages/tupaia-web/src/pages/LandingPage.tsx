/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';

export const LandingPage = () => {
  const { landingPageUrlSegment } = useParams();
  // use the landingPageUrlSegment to query for the landing page.
  // If found, render landing page. If not, render a default landing page
  return <div>{landingPageUrlSegment}</div>;
};
