/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import { ListItem, ListItemProps } from '@material-ui/core';

export const ActivityFeedItem = styled(ListItem)<ListItemProps>`
  color: ${({ theme }) => theme.palette.text.primary};
  background: ${({ theme }) => theme.palette.background.paper};
  font-size: 0.75rem;
  padding-inline: 1.8rem;
  padding-block-start: 1.12rem;
  padding-block-end: 0.75rem;
  position: relative;
  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 0.875rem;
    margin-top: 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .MuiTypography-colorTextSecondary {
    font-size: 0.75rem;
    margin-top: 0.2rem;
  }

  &:hover,
  &:focus {
    text-decoration: none;
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1.12rem 0.6rem 0.75rem 0;

    p {
      font-size: 0.75rem;
    }
    .MuiTypography-colorTextSecondary {
      font-size: 0.625rem;
    }
    &:not(:last-child) {
      border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    }
  }
`;
