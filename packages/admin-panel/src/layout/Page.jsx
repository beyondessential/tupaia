/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Container } from '@material-ui/core';
import styled from 'styled-components';

export const PageContentWrapper = styled(Container).attrs({
  maxWidth: false,
})`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-block: 0;
  padding-inline: 1.5rem;
  max-height: 100%;
  overflow: hidden;
`;
