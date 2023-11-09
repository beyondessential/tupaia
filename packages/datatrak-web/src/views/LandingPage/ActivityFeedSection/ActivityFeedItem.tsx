/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import { ListItem, ListItemProps } from '@material-ui/core';

export const ActivityFeedItem = styled(ListItem)<ListItemProps>`
  padding: 1.12rem 0.6rem 0.6rem 0;
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  }
  p {
    font-size: 0.75rem;
    margin-top: 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .MuiTypography-colorTextSecondary {
    font-size: 0.625rem;
    margin-top: 0.2rem;
  }
`;
