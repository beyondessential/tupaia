/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import styled from 'styled-components';
import { BackgroundPageLayout } from './BackgroundPageLayout';

export const AuthPageLayout = styled(BackgroundPageLayout).attrs({
  backgroundImage: '/auth-background.svg',
})`
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
