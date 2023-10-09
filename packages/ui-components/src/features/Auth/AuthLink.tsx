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
  margin-top: 1.25rem;
  a {
    color: ${props => props.theme.palette.text.primary};
  }
`;
