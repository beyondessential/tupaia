/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { UseQueryResult } from 'react-query';
import { Typography, Link, CircularProgress } from '@material-ui/core';
import { Alert as BaseAlert, NoData, TextButton } from '@tupaia/ui-components';
import { ExpandItemButton } from './ExpandItemButton';
import {
  View,
  Chart,
  Matrix,
  ProjectDescription,
  NoAccessDashboard,
  NoDataAtLevelDashboard,
} from '../Visuals';
import {
  ChartReport,
  DashboardItemReport,
  MatrixReport,
  ViewReport,
  DashboardItem,
  DashboardItemConfig,
} from '../../types';

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
    width: 100%;
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
  margin-top: ${({ $isExporting }) => ($isExporting ? '1rem' : '0')};
`;

const DisplayComponents = {
  chart: Chart,
  view: View,
  matrix: Matrix,
  ProjectDescription,
  NoAccessDashboard,
  NoDataAtLevelDashboard,
};

interface DashboardItemContentProps {
  dashboardItem?: DashboardItem;
  report: DashboardItemReport;
  isEnlarged?: boolean;
  isLoading: boolean;
  error: UseQueryResult['error'] | null;
  onRetryFetch?: UseQueryResult['refetch'];
  isExpandable: boolean;
  isExporting?: boolean;
}

const getHasNoData = (report: DashboardItemReport, type: DashboardItemConfig['type']) => {
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
  dashboardItem = {} as DashboardItem,
  report,
  isEnlarged,
  isLoading,
  error,
  onRetryFetch,
  isExpandable,
  isExporting,
}: DashboardItemContentProps) => {
  const { reportCode, config } = dashboardItem;
  const { name, type, viewType, componentName } = config || {};

  const componentKey = componentName || type;

  const DisplayComponent = DisplayComponents[componentKey as keyof typeof DisplayComponents];

  if (!DisplayComponent) return null;

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
          {isExporting ? (
            <>
              Contact <ErrorLink href="mailto:support@tupaia.org">support@tupaia.org</ErrorLink>
            </>
          ) : (
            <>
              <RetryButton onClick={onRetryFetch}>Retry loading data</RetryButton> or contact{' '}
              <ErrorLink href="mailto:support@tupaia.org">support@tupaia.org</ErrorLink>
            </>
          )}
        </Typography>
      </Alert>
    );

  // if there is no data for the selected dates, then we want to show a message to the user
  const showNoDataMessage = getHasNoData(report, type);

  return (
    <>
      {showNoDataMessage ? (
        <NoData
          viewContent={{
            ...config,
            ...report,
          }}
        />
      ) : (
        <DisplayComponent
          report={report}
          config={config}
          isEnlarged={isEnlarged}
          isExporting={isExporting}
        />
      )}
      {/** We still want to have the expand button if there is no data because in some cases the user can expand and change the dates */}
      {isExpandable && <ExpandItemButton viewType={viewType} reportCode={reportCode} />}
    </>
  );
};
