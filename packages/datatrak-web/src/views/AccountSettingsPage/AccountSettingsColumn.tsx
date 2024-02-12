/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';

export const AccountSettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  width: 100%;

  & > * {
    margin-top: 0;
  }
  &:first-child {
    margin-bottom: 1.9rem;
  }
  &:last-child {
    margin-bottom: 0;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    width: 28.5%;
    margin-bottom: 0;
    &:first-child {
      width: 43%;
      margin-bottom: 0;
      p {
        max-width: 22rem;
      }
    }
    &:last-child {
      justify-content: flex-end;
    }
  }
`;
