/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Container } from '@material-ui/core';
import styled from 'styled-components';

export const PageContainer = styled(Container).attrs({
  maxWidth: false,
})`
  position: relative;
  flex: 1;
  padding: 0;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 0 1rem;
  }
`;
