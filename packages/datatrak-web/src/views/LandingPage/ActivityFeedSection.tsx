/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SectionHeading } from './SectionHeading';

const ActivityFeed = styled.section`
  grid-area: activityFeed;

  ${({ theme }) => theme.breakpoints.up('lg')} {
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;

const ScrollBody = styled.div`
  overflow: auto;
  background: white;
  border-radius: 10px;
  flex: 1;
`;

export const ActivityFeedSection = () => {
  return (
    <ActivityFeed>
      <SectionHeading>Activity feed</SectionHeading>
      <ScrollBody></ScrollBody>
    </ActivityFeed>
  );
};
