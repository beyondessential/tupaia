/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import { WHITE } from '../../theme/colors';

export const UserLink = styled(Button).attrs({
  variant: 'text',
  color: 'inherit',
})`
  margin-block-start: 0.5rem;
  text-decoration: none;
  color: ${WHITE};
  font-weight: normal;
  padding: 0;
  justify-content: flex-start;
  &:hover,
  &:focus {
    text-decoration: underline;
  }
  .MuiButton-label {
    font-size: 0.6875rem;
  }
`;
