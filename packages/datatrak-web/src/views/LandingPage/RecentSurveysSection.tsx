/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';

const RecentSurveys = styled.section`
  grid-area: recentSurveys;
  display: flex;
  flex-direction: column;
  height: 8rem;
`;

const ScrollBody = styled.div`
  background: white;
  border-radius: 10px;
  flex: 1;

  ${({ theme }) => theme.breakpoints.up('lg')} {
    min-height: auto;
  }
`;

export const RecentSurveysSection = () => {
  return (
    <RecentSurveys>
      <SectionHeading>My recent surveys</SectionHeading>
      <ScrollBody></ScrollBody>
    </RecentSurveys>
  );
};
