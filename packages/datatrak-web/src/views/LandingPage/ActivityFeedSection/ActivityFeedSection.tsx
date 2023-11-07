/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { FeedItemTypes } from '@tupaia/types';
import { SectionHeading } from '../SectionHeading';
import { useActivityFeed } from '../../../api/queries';
import { ActivityFeedSurveyItem } from './ActivityFeedSurveyItem';
import { ActivityFeedMarkdownItem } from './ActivityFeedMarkdownItem';
import { MarkdownFeedItem, SurveyResponseFeedItem } from '../../../types';
import { InfiniteScroll } from './InfiniteScroll';

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

const List = styled.ul`
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 10px;
  padding: 0 1.8rem;
  margin: 0;
  flex: 1;
`;

export const ActivityFeedSection = () => {
  const { data: activityFeed, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivityFeed();

  return (
    <ActivityFeed>
      <SectionHeading>Activity feed</SectionHeading>
      <InfiniteScroll
        onScroll={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      >
        <List>
          {/** Creating a new flattened array out of these pages caused a re-render on all updates which led to some bugs, so doing a nested map is better here */}
          {activityFeed?.pages?.map(page =>
            page?.items?.map(feedItem =>
              feedItem.type === FeedItemTypes.SurveyResponse ? (
                <ActivityFeedSurveyItem
                  feedItem={feedItem as SurveyResponseFeedItem}
                  key={feedItem.id}
                />
              ) : (
                <ActivityFeedMarkdownItem
                  feedItem={feedItem as MarkdownFeedItem}
                  key={feedItem.id}
                />
              ),
            ),
          )}
        </List>
      </InfiniteScroll>
    </ActivityFeed>
  );
};
