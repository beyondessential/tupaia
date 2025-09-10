import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { periodToMoment } from '@tupaia/utils';
import { DashboardItemContext } from './DashboardItemContext';

const LatestAvailable = styled(Typography).attrs({
  color: 'textSecondary',
})<{
  $isEnlarged?: boolean;
}>`
  font-size: 0.6rem;
  text-align: ${({ $isEnlarged }) => ($isEnlarged ? 'left' : 'center')};
`;

/**
 * DashboardItemContent handles displaying of the content within a dashboard item, e.g. charts. It also handles error messages and loading states
 */
export const DashboardItemDateDisplay = () => {
  const { config, report, isExport, isLoading, isEnlarged } = useContext(DashboardItemContext);

  if (!config || !report || isExport || isLoading) return null;

  const { type } = config;
  const { period } = report!;
  const showPeriodRange = type === 'chart' ? config?.showPeriodRange : null;

  if (!period?.latestAvailable) return null;
  const showLatestAvailable = isEnlarged ? showPeriodRange === 'all' : !!showPeriodRange;

  if (!showLatestAvailable) return null;

  return (
    <LatestAvailable $isEnlarged={isEnlarged}>
      Latest available data: {periodToMoment(period.latestAvailable).format('DD/MM/YY')}
    </LatestAvailable>
  );
};
