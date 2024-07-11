/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { PageContainer as BasePageContainer } from '../components';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-block-start: 0.75rem;
  padding-block-end: 2rem;
  padding-inline: 3rem;

  .MuiFormLabel-root {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-block-end: 0.2rem;
    font-size: 0.875rem;
  }
  .MuiFormLabel-asterisk {
    color: ${({ theme }) => theme.palette.error.main};
  }
  .MuiInputBase-root {
    font-size: 0.875rem;
  }
  .MuiOutlinedInput-input {
    padding-block: 0.9rem;
  }
  input::placeholder {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }
  .MuiInputBase-root.Mui-error {
    background-color: transparent;
  }
`;

export const TasksLayout = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};
