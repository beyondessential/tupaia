/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { UseQueryResult } from 'react-query';
import { Alert, TextButton } from '@tupaia/ui-components';
import { Typography, Link, CircularProgress } from '@material-ui/core';
import { DashboardItemDisplayProps } from '../../../types';
import { Chart } from '../../Chart';
import { ExpandItemButton } from './ExpandItemButton';

const Title = styled(Typography)<{
  $isEnlarged?: boolean;
}>`
  font-size: ${({ $isEnlarged }) => ($isEnlarged ? '1.2rem' : '1rem')};
  font-weight: ${({ $isEnlarged, theme }) =>
    $isEnlarged ? theme.typography.fontWeightBold : theme.typography.fontWeightRegular};
  text-align: center;
  margin: 0.3rem 0 1rem 0;
  line-height: 1.4;
`;

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
};

interface DashboardItemContentProps {
  viewContent: DashboardItemDisplayProps;
  isEnlarged?: boolean;
  isLoading: boolean;
  error: UseQueryResult['error'] | null;
  onRetryFetch: UseQueryResult['refetch'];
  isExpandable: boolean;
}

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
      {name && (
        <Title $isEnlarged={isEnlarged} variant={isEnlarged ? 'h2' : 'h3'}>
          {name}
        </Title>
      )}
      <DisplayComponent viewContent={viewContent} isEnlarged={isEnlarged} />
      {isExpandable && <ExpandItemButton viewType={viewType} reportCode={reportCode} />}
    </>
  );
};
