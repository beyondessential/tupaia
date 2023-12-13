/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';

export const AccountSettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
  &:not(:last-child) {
    padding-right: 2rem;
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
