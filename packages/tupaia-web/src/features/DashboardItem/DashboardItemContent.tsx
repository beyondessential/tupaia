/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { UseQueryResult } from 'react-query';
import { Alert as BaseAlert, SmallAlert, TextButton } from '@tupaia/ui-components';
import { Typography, Link, CircularProgress } from '@material-ui/core';
import { Chart } from '../Chart';
import { ExpandItemButton } from './ExpandItemButton';
import { View } from '../View';
import { Matrix } from '../Matrix';
import {
  ChartReport,
  DashboardItemReport,
  DashboardItemType,
  MatrixReport,
  ViewReport,
} from '../../types';
import { DashboardItemConfig } from '@tupaia/types';

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
  config: DashboardItemType;
  report: DashboardItemReport;
  isEnlarged?: boolean;
  isLoading: boolean;
  error: UseQueryResult['error'] | null;
  onRetryFetch: UseQueryResult['refetch'];
  isExpandable: boolean;
}

export const getNoDataString = (report: DashboardItemReport, config: DashboardItemType) => {
  const { startDate, endDate } = report;
  const { noDataMessage, source } = config;
  if (noDataMessage) {
    return noDataMessage;
  }

  if (source === 'mSupply') {
    return 'Requires mSupply';
  }

  if (startDate && endDate) {
    return `No data for ${startDate} to ${endDate}`;
  }

  return 'No data for selected dates';
};

const getShowNoDataMessage = (report: DashboardItemReport, type: DashboardItemConfig['type']) => {
  // If there is no report, if means it is loading or there is an error, which is handled elsewhere
  if (!report) return false;
  if (type === 'matrix') {
    return (report as MatrixReport)?.rows?.length === 0;
  }
  if (type === 'view' || type === 'chart') {
    return (report as ViewReport | ChartReport)?.data?.length === 0;
  }
  return false;
};
/**
 * DashboardItemContent handles displaying of the content within a dashboard item, e.g. charts. It also handles error messages and loading states
 */
export const DashboardItemContent = ({
  config,
  report,
  isEnlarged,
  isLoading,
  error,
  onRetryFetch,
  isExpandable,
}: DashboardItemContentProps) => {
  const { name, reportCode, type, viewType } = config;

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

  // if there is no data for the selected dates, then we want to show a message to the user
  const showNoDataMessage = getShowNoDataMessage(report, type);

  return (
    <>
      {showNoDataMessage ? (
        <SmallAlert severity="info" variant="standard">
          {getNoDataString(report, config)}
        </SmallAlert>
      ) : (
        <DisplayComponent report={report} config={config} isEnlarged={isEnlarged} />
      )}
      {/** We still want to have the expand button if there is no data because in some cases the user can expand and change the dates */}
      {isExpandable && <ExpandItemButton viewType={viewType} reportCode={reportCode} />}
    </>
  );
};
