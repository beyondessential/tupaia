/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { ListItemProps, ListItem as MuiListItem, Typography } from '@material-ui/core';
import { MarkdownFeedItem } from '../../../types';

const ListItem = styled(MuiListItem)<ListItemProps>`
  padding: 1.2rem 0.6rem 1.2rem 0;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

export const ActivityFeedMarkdownItem = ({ feedItem }: { feedItem: MarkdownFeedItem }) => {
  const { templateVariables } = feedItem;

  return (
    <ListItem>
      <Typography>
        <b>{templateVariables?.title}</b>
      </Typography>
    </ListItem>
  );
};
