/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';

export const ScrollableBody = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1rem 1rem 3rem;
  ${({ theme }) => theme.breakpoints.up('md')} {
    padding: 1rem 2.5rem;
  }
`;
