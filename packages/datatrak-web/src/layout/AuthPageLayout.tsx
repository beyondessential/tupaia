/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { PageContainer } from '../components';
import { HEADER_HEIGHT } from '../constants';

export const Background = styled.div`
  width: 100%;
  height: 100%;
  background-image: url('/auth-background.svg');
  background-position: top center;
  background-size: cover;
  min-height: calc(100vh - ${HEADER_HEIGHT});
  display: flex;

  .auth-page {
    h2 {
      font-weight: ${({ theme }) => theme.typography.fontWeightBold};
    }
    h3 {
      margin-top: 0.32rem;
    }
    .MuiFormControl-root {
      margin-bottom: 1rem;
    }
    .MuiTypography-root.MuiFormControlLabel-label {
      font-size: 0.6875rem;
    }
    .MuiTypography-root.MuiFormControlLabel-label a {
      font-size: 0.6875rem;
    }
    .MuiSvgIcon-root {
      font-size: 1rem;
    }
    .MuiCheckbox-root {
      padding-right: 0.375rem;
    }
    form a {
      &:hover,
      &:focus {
        color: ${({ theme }) => theme.palette.primary.main};
      }
    }
    .MuiTypography-root > a {
      font-weight: ${({ theme }) => theme.typography.fontWeightBold};
      text-decoration: none;
      color: ${({ theme }) => theme.palette.text.primary};
      &:hover,
      &:focus {
        text-decoration: underline;
      }
    }
  }
`;

export const AuthPageLayout = () => {
  return (
    <Background>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </Background>
  );
};
