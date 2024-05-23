/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router';
import { SimplePageLayout } from './SimplePageLayout';

export const CenteredPageContent = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  .MuiPaper-root {
    border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  }
`;

export const AuthLayout = () => {
  return (
    <SimplePageLayout>
      <CenteredPageContent>
        <Outlet />
      </CenteredPageContent>
    </SimplePageLayout>
  );
};
