/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Typography } from '@material-ui/core';
import styled from 'styled-components';

export const AuthLink = styled(Typography).attrs({
  align: 'center',
})`
  font-size: 0.8125rem;
  text-wrap: balance;
  margin-block-start: 1.25rem;
  a {
    color: ${props => props.theme.palette.text.primary};
    margin-inline-start: 0.25rem;
  }
`;
