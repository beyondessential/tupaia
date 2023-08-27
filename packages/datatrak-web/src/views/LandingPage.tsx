/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ButtonLink, PageContainer } from '../components';

export const LandingPage = () => {
  return (
    <PageContainer>
      <h1>Landing Page</h1>
      <ButtonLink to="/survey">Select survey</ButtonLink>
      <ButtonLink to="/explore/TO/BCD_DL/1">Example survey</ButtonLink>
      <ButtonLink to="/survey/questions">Survey questions</ButtonLink>
    </PageContainer>
  );
};
