/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ButtonLink, PageContainer } from '../components';
import { TopProgressBar } from '../components/TopProgressBar';

export const LandingPage = () => {
  return (
    <PageContainer>
      <h1>Landing Page</h1>
      <ButtonLink to="/survey">Select survey</ButtonLink>
      <ButtonLink to="/survey/questions">Survey questions</ButtonLink>
      <TopProgressBar currentSurveyQuestion = {25} totalNumberOfSurveyQuestions = {100}/>
    </PageContainer>
  );
};
