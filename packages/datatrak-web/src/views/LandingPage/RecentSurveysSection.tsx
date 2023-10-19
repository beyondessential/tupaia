/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';

const RecentSurveys = styled.div`
  grid-area: recentSurveys;
`;

export const RecentSurveysSection = () => {
  return (
    <RecentSurveys>
      <SectionHeading>My recent surveys</SectionHeading>
      <section></section>
    </RecentSurveys>
  );
};
