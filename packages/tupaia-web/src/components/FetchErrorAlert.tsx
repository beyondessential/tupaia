/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography, Link } from '@material-ui/core';
import { Alert as BaseAlert, TextButton } from '@tupaia/ui-components';
import { UseQueryResult } from '@tanstack/react-query';

const ErrorLink = styled(Link)`
  color: inherit;
  text-decoration: underline;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;
const RetryButton = styled(TextButton)`
  margin: 0;
  padding: 0;
  text-decoration: underline;
  text-transform: none;
  font-size: inherit;
  line-height: inherit;
  vertical-align: inherit;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
`;

const Alert = styled(BaseAlert)`
  overflow: hidden; // this is to stop any extra long text from overflowing the alert and causing a horizontal scroll on the dashboard
  box-shadow: none;
  .MuiAlert-message {
    max-width: 100%;
    width: 100%;
  }
  p {
    max-width: 90%;
    word-wrap: break-word;
  }
`;

interface FetchErrorAlertProps {
  error: UseQueryResult['error'] | null;
  refetch: UseQueryResult['refetch'];
}
/**
 * DashboardItemError handles error displays for dashboard items in both enlarged and collapsed states
 */
export const FetchErrorAlert = ({ error, refetch }: FetchErrorAlertProps) => {
  return (
    <Alert severity="error">
      <Typography>{error.message}</Typography>
      <Typography>
        {refetch ? (
          <>
            <RetryButton onClick={refetch}>Retry loading data</RetryButton> or contact{' '}
            <ErrorLink href="mailto:support@tupaia.org">support@tupaia.org</ErrorLink>
          </>
        ) : (
          <>
            Contact <ErrorLink href="mailto:support@tupaia.org">support@tupaia.org</ErrorLink>
          </>
        )}
      </Typography>
    </Alert>
  );
};
