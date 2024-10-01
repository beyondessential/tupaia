/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useCurrentProjectActivityFeed } from '../../../api/queries';
import { InfiniteScroll } from './InfiniteScroll';
import { SkeletonFeed } from './SkeletonFeed';
import { ActivityFeedList } from './ActivityFeedList';

const Body = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 0.625rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    background: ${({ theme }) => theme.palette.background.paper};
  }
`;

export const InfiniteActivityFeed = () => {
  const {
    data: activityFeed,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useCurrentProjectActivityFeed();
  const isInitialLoad = !activityFeed;
  return (
    <Body>
      {isInitialLoad ? (
        <SkeletonFeed />
      ) : (
        <InfiniteScroll
          onScroll={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetching}
        >
          <ActivityFeedList items={activityFeed?.pages.flatMap(page => page.items)} />
        </InfiniteScroll>
      )}
    </Body>
  );
};
