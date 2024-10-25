/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';

export const ScrollableBody = styled.div<{
  $hasSidebar?: boolean;
}>`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: ${({ $hasSidebar }) => ($hasSidebar ? '1rem 1rem 1rem 5rem' : '1rem 2rem')};
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1rem 2.5rem;
  }
`;
