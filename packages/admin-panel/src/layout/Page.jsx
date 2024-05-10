/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Container } from '@material-ui/core';
import styled from 'styled-components';

export const PageWrapper = styled.div`
  display: grid;
  grid-template-columns: 18rem 1fr;
`;

export const Main = styled.main`
  width: 100%;
  overflow-x: auto;
  height: 100vh;
  // This is so that we can make the PageBody component fill the whole remaining height of the screen
  display: flex;
  flex-direction: column;
`;

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
