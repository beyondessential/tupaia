/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router';
import { Background as BaseBackground } from './BackgroundPageLayout';
import { PageContainer } from '../components';

export const Background = styled(BaseBackground)`
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
  p a {
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
    text-decoration: none;
    color: ${({ theme }) => theme.palette.text.primary};
    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
`;

export const AuthPageLayout = () => {
  return (
    <Background $backgroundImage={'/auth-background.svg'}>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </Background>
  );
};
