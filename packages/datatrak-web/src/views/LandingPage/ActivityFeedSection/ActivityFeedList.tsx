import { Link } from '@material-ui/core';
import { DatatrakWebActivityFeedRequest, FeedItemTypes } from '@tupaia/types';
import React from 'react';
import styled from 'styled-components';
import { MarkdownFeedItem, SurveyResponseFeedItem } from '../../../types';
import { isNotNullish } from '../../../utils';
import { ActivityFeedItem } from './ActivityFeedItem';
import { ActivityFeedMarkdownItem } from './ActivityFeedMarkdownItem';
import { ActivityFeedSurveyItem } from './ActivityFeedSurveyItem';
import { PinnedFeedItem } from './PinnedFeedItem';

const List = styled.ul`
  border-radius: 10px;
  padding: 0;
  margin: 0;
  flex: 1;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 0 1.8rem;
  }
`;

interface ActivityFeedListProps {
  items?: DatatrakWebActivityFeedRequest.ResBody['items'];
}

export const ActivityFeedList = ({ items }: ActivityFeedListProps) => {
  // HACK: Sometimes get `undefined` items in test environment (culprit: .../__integration__/login.test.tsx)
  // TODO: Investigate why this is happening. Likely due to mocking of feed items API response.
  const ensuredItems = items?.filter(isNotNullish);

  return (
    <List>
      <PinnedFeedItem />
      {/** Creating a new flattened array out of these pages caused a re-render on all updates which led to some bugs, so doing a nested map is better here */}
      {ensuredItems?.map(feedItem => (
        <ActivityFeedItem
          key={feedItem.id}
          button={!!feedItem?.templateVariables?.link}
          component={feedItem?.templateVariables?.link ? Link : undefined}
          href={feedItem?.templateVariables?.link}
          target="_blank"
        >
          {feedItem.type === FeedItemTypes.SurveyResponse ? (
            <ActivityFeedSurveyItem feedItem={feedItem as SurveyResponseFeedItem} />
          ) : (
            <ActivityFeedMarkdownItem feedItem={feedItem as MarkdownFeedItem} />
          )}
        </ActivityFeedItem>
      ))}
    </List>
  );
};
