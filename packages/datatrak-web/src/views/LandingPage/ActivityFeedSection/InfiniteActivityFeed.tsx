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

  ${({ theme }) => theme.breakpoints.up('md')} {
    border-radius: 0.625rem;
    background: ${({ theme }) => theme.palette.background.paper};
  }
`;

export const InfiniteActivityFeed = React.forwardRef<HTMLDivElement, {}>((_props, ref) => {
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
          ref={ref}
          onScroll={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetching}
        >
          <ActivityFeedList items={activityFeed?.pages.flatMap(page => page.items)} />
        </InfiniteScroll>
      )}
    </Body>
  );
});
