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
  padding: 0;
  flex: 1;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 0 1.25rem;
  }
`;
