import React from 'react';
import styled from 'styled-components';
import { useCurrentProjectActivityFeed } from '../../../api/queries';
import { useIsOnline } from '../../../utils';
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
  const isOnline = useIsOnline();
  const isInitialLoad = !activityFeed;
  // `fetchNextPage` bypasses the query's `enabled` guard, so without this the infinite scroll would
  // keep requesting pages while offline and spam network errors. Hiding the loader stops it, and it
  // resumes automatically once connectivity returns.
  const canFetchNextPage = hasNextPage && isOnline;
  return (
    <Body>
      {isInitialLoad ? (
        <SkeletonFeed />
      ) : (
        <InfiniteScroll
          ref={ref}
          onScroll={fetchNextPage}
          hasNextPage={canFetchNextPage}
          isFetchingNextPage={isFetching}
        >
          <ActivityFeedList items={activityFeed?.pages.flatMap(page => page.items)} />
        </InfiniteScroll>
      )}
    </Body>
  );
});
