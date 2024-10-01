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
