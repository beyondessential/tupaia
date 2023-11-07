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
import { PinnedFeedItem } from './PinnedFeedItem';
import { ActivityFeedItem } from './ActivityFeedItem';

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

const Body = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.palette.background.paper};
  border-radius: 0.625rem;
`;

export const ActivityFeedSection = () => {
  const { data: activityFeed, fetchNextPage, hasNextPage, isFetchingNextPage } = useActivityFeed();

  return (
    <ActivityFeed>
      <SectionHeading>Activity feed</SectionHeading>
      <Body>
        <InfiniteScroll
          onScroll={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        >
          <List>
            <PinnedFeedItem />
            {/** Creating a new flattened array out of these pages caused a re-render on all updates which led to some bugs, so doing a nested map is better here */}
            {activityFeed?.pages?.map(page =>
              page?.items?.map(feedItem => (
                <ActivityFeedItem key={feedItem.id}>
                  {feedItem.type === FeedItemTypes.SurveyResponse ? (
                    <ActivityFeedSurveyItem feedItem={feedItem as SurveyResponseFeedItem} />
                  ) : (
                    <ActivityFeedMarkdownItem feedItem={feedItem as MarkdownFeedItem} />
                  )}
                </ActivityFeedItem>
              )),
            )}
          </List>
        </InfiniteScroll>
      </Body>
    </ActivityFeed>
  );
};
