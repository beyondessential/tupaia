/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from '../SectionHeading';
import { DesktopActivityFeed } from './DesktopActivityFeed';
import { MobileActivityFeed } from './MobileActivityFeed';

const ActivityFeed = styled.section`
  grid-area: activityFeed;
  display: flex;
  flex-direction: column;
  height: auto;
  ${({ theme }) => theme.breakpoints.up('md')} {
    height: 25rem;
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;

export const ActivityFeedSection = () => {
  return (
    <ActivityFeed>
      <SectionHeading>Activity feed</SectionHeading>
      <DesktopActivityFeed />
      <MobileActivityFeed />
    </ActivityFeed>
  );
};
