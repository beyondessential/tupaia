import React from 'react';
import styled from 'styled-components';
import { useIsMobile } from '../../../utils';
import { SectionHeading } from '../SectionHeading';
import { DesktopActivityFeed } from './DesktopActivityFeed';
import { MobileActivityFeed } from './MobileActivityFeed';

const ActivityFeed = styled.section`
  grid-area: --activityFeed;
  display: flex;
  flex-direction: column;
  height: auto;
`;

export const ActivityFeedSection = () => {
  // Mount only the feed for this size class. Hiding the other one with CSS would still run its
  // query and render its items
  const isMobile = useIsMobile();
  return (
    <ActivityFeed>
      <SectionHeading>Activity feed</SectionHeading>
      {isMobile === false && <DesktopActivityFeed />}
      {isMobile === true && <MobileActivityFeed />}
    </ActivityFeed>
  );
};
