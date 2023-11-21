/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useCurrentProjectActivityFeed } from '../../../api/queries';
import { ActivityFeedMarkdownItem } from './ActivityFeedMarkdownItem';
import styled from 'styled-components';
import { ActivityFeedItem } from './ActivityFeedItem';
import { PinIcon as BasePinIcon } from '../../../components';

const PinIcon = styled(BasePinIcon)`
  position: absolute;
  top: 1.7rem;
  left: -1.2rem;
  font-size: 1rem;
`;

export const PinnedFeedItem = () => {
  const { data: activityFeed } = useCurrentProjectActivityFeed();

  if (!activityFeed || !activityFeed?.pages?.length) return null;

  const { pinned } = activityFeed.pages[0];

  if (!pinned) return null;
  return (
    <ActivityFeedItem>
      <PinIcon />
      <ActivityFeedMarkdownItem feedItem={pinned} />
    </ActivityFeedItem>
  );
};
