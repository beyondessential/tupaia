/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Container } from '@material-ui/core';
import styled from 'styled-components';
import { MOBILE_BREAKPOINT } from '../constants';

export const PageContainer = styled(Container)`
  position: relative;
  flex: 1;
  padding: 0;
  @media (min-width: ${MOBILE_BREAKPOINT}) {
    padding: 0 1rem;
  }
`;
