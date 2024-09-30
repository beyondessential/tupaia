/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from '@material-ui/core';
import { useCurrentProjectActivityFeed } from '../../../api/queries';
import { PinIcon as BasePinIcon } from '../../../components';
import { ActivityFeedMarkdownItem } from './ActivityFeedMarkdownItem';
import { ActivityFeedItem } from './ActivityFeedItem';
import { DESKTOP_MEDIA_QUERY } from '../../../constants';

const PinIcon = styled(BasePinIcon)`
  position: absolute;
  top: 1.5rem;
  left: 1.3rem;
  font-size: 1rem;
  ${DESKTOP_MEDIA_QUERY} {
    left: -1.3rem;
  }
`;

export const PinnedFeedItem = () => {
  const { data: activityFeed } = useCurrentProjectActivityFeed();

  if (!activityFeed || !activityFeed?.pages?.length) return null;

  const { pinned } = activityFeed.pages[0];

  if (!pinned) return null;
  const { link } = pinned.templateVariables;
  return (
    <ActivityFeedItem
      button={!!link}
      component={link ? Link : undefined}
      href={link}
      target="_blank"
    >
      <PinIcon />
      <ActivityFeedMarkdownItem feedItem={pinned} isPinned />
    </ActivityFeedItem>
  );
};
