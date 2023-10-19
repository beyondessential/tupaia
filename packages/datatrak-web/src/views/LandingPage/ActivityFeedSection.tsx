/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';

const ActivityFeed = styled.div`
  grid-area: activityFeed;

  ${({ theme }) => theme.breakpoints.up('lg')} {
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;
export const ActivityFeedSection = () => {
  return (
    <ActivityFeed>
      <SectionHeading>Activity Feed</SectionHeading>
      <section></section>
    </ActivityFeed>
  );
};
