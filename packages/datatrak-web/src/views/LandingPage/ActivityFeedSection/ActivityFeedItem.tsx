import styled from 'styled-components';
import { ListItem, ListItemProps } from '@material-ui/core';

export const ActivityFeedItem = styled(ListItem)<ListItemProps>`
  color: ${({ theme }) => theme.palette.text.primary};
  display: block;
  background: ${({ theme }) => theme.palette.background.paper};
  font-size: 0.75rem;
  padding-inline: 1.5rem;
  padding-block-start: 1.2rem;
  padding-block-end: 1.2rem;
  position: relative;
  &:not(:last-child) {
    margin-bottom: 0.3rem;
  }
  p {
    font-size: 0.875rem;
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

  // desktop view
  ${({ theme }) => theme.breakpoints.up('md')} {
    display: flex;
    padding: 1rem 0.6rem 0.75rem 0;

    p {
      font-size: 0.75rem;
    }
    .MuiTypography-colorTextSecondary {
      font-size: 0.625rem;
    }
    &:not(:last-child) {
      margin-bottom: 0;
      border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    }
  }
`;
