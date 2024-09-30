/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from '@material-ui/core';
import { DatatrakWebActivityFeedRequest, FeedItemTypes } from '@tupaia/types';
import { MarkdownFeedItem, SurveyResponseFeedItem } from '../../../types';
import { ActivityFeedSurveyItem } from './ActivityFeedSurveyItem';
import { ActivityFeedMarkdownItem } from './ActivityFeedMarkdownItem';
import { PinnedFeedItem } from './PinnedFeedItem';
import { ActivityFeedItem } from './ActivityFeedItem';
import { DESKTOP_MEDIA_QUERY } from '../../../constants';

const List = styled.ul`
  border-radius: 10px;
  padding: 0;
  margin: 0;
  flex: 1;
  ${DESKTOP_MEDIA_QUERY} {
    padding: 0 1.8rem;
  }
`;

interface ActivityFeedListProps {
  items?: DatatrakWebActivityFeedRequest.ResBody['items'];
}

export const ActivityFeedList = ({ items = [] }: ActivityFeedListProps) => {
  return (
    <List>
      <PinnedFeedItem />
      {/** Creating a new flattened array out of these pages caused a re-render on all updates which led to some bugs, so doing a nested map is better here */}
      {items?.map(feedItem => (
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
