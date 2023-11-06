/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SectionHeading } from '../SectionHeading';
import { useActivityFeed } from '../../../api/queries';
import { ActivityFeedSurveyItem } from './ActivityFeedSurveyItem';
import { ActivityFeedResponse, FeedItem } from '../../../types';

const ActivityFeed = styled.section`
  grid-area: activityFeed;
  display: flex;
  flex-direction: column;
  height: 25rem;

  ${({ theme }) => theme.breakpoints.up('lg')} {
    margin-left: 1rem;
    margin-right: 1rem;
  }
`;

const ScrollBody = styled.ul`
  overflow: auto;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 10px;
  padding: 0 1.8rem;
  margin: 0;
  flex: 1;
`;

const InfiniteScroll = ({ children, onScroll }: { children: ReactNode; onScroll: () => void }) => {
  const loader = useRef(null);
  const container = useRef(null);

  const handleObserver = useCallback(entries => {
    const target = entries[0];
    if (target.isIntersecting) {
      console.log(target);
      // setPage((prev) => prev + 1);
    }
  }, []);

  useEffect(() => {
    if (!container?.current || loader?.current) return;
    const getIsVisible = function () {
      const { bottom, height, top } = loader?.current?.getBoundingClientRect();
      const containerRect = container?.current?.getBoundingClientRect();

      return top <= containerRect.top
        ? containerRect.top - top <= height
        : bottom - containerRect.bottom <= height;
    };

    const isVisible = getIsVisible();
    console.log(isVisible);
  }, [container?.current, loader?.current]);
  return (
    <ScrollBody ref={container}>
      {children}

      <div ref={loader}>Loading...</div>
    </ScrollBody>
  );
};

export const ActivityFeedSection = () => {
  const { data: activityFeed, fetchNextPage } = useActivityFeed();
  const allData = activityFeed?.pages?.reduce((result: FeedItem[], page: ActivityFeedResponse) => {
    const { items } = page;
    if (!items) return result;
    return [...result, ...items];
  }, []);

  return (
    <ActivityFeed>
      <SectionHeading>Activity feed</SectionHeading>
      <InfiniteScroll onScroll={fetchNextPage}>
        {allData?.map(feedItem => (
          <ActivityFeedSurveyItem feedItem={feedItem} key={feedItem.id} />
        ))}
      </InfiniteScroll>
    </ActivityFeed>
  );
};
