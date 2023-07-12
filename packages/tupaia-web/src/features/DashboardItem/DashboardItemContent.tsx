/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { UseQueryResult } from 'react-query';
import { Alert as BaseAlert, TextButton } from '@tupaia/ui-components';
import { ViewContent as ChartViewContent } from '@tupaia/ui-chart-components';
import { Typography, Link, CircularProgress } from '@material-ui/core';
import { Chart } from '../Chart';
import { ExpandItemButton } from './ExpandItemButton';
import { View } from '../View';
import { Matrix } from '../Matrix';
import { DashboardItemType, MatrixViewContent } from '../../types';

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
  .MuiAlert-message {
    max-width: 100%;
  }
  p {
    max-width: 90%;
    word-wrap: break-word;
  }
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const DisplayComponents = {
  chart: Chart,
  view: View,
  matrix: Matrix,
};

interface DashboardItemContentProps {
  viewContent: DashboardItemType & (ChartViewContent | MatrixViewContent);
  isEnlarged?: boolean;
  isLoading: boolean;
  error: UseQueryResult['error'] | null;
  onRetryFetch: UseQueryResult['refetch'];
  isExpandable: boolean;
}

/**
 * DashboardItemContent handles displaying of the content within a dashboard item, e.g. charts. It also handles error messages and loading states
 */
export const DashboardItemContent = ({
  viewContent,
  isEnlarged,
  isLoading,
  error,
  onRetryFetch,
  isExpandable,
}: DashboardItemContentProps) => {
  const { name, reportCode, type, viewType } = viewContent;

  const DisplayComponent = DisplayComponents[type as keyof typeof DisplayComponents] || null;

  if (isLoading)
    return (
      <LoadingContainer aria-label={`Loading data for report '${name}'`}>
        <CircularProgress />
      </LoadingContainer>
    );

  if (error)
    return (
      <Alert severity="error">
        <Typography>{error.message}</Typography>
        <Typography>
          <RetryButton onClick={onRetryFetch}>Retry loading data</RetryButton> or contact{' '}
          <ErrorLink href="mailto:support@tupaia.org">support@tupaia.org</ErrorLink>
        </Typography>
      </Alert>
    );

  return (
    <>
      {DisplayComponent && <DisplayComponent viewContent={viewContent} isEnlarged={isEnlarged} />}
      {isExpandable && <ExpandItemButton viewType={viewType} reportCode={reportCode} />}
    </>
  );
};
