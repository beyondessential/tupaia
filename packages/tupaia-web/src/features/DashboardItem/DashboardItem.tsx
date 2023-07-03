/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Moment } from 'moment';
import { useParams } from 'react-router';
import { Typography } from '@material-ui/core';
import { getDefaultDates } from '@tupaia/utils';
import { DashboardItemType } from '../../types';
import { useDashboards, useReport } from '../../api/queries';
import { DashboardItemContent } from './DashboardItemContent';

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  place-content: stretch center;
  margin-bottom: 0.5rem;
  width: 100%;
  max-width: 100%;
  min-height: 6.25rem;
  position: relative;
  padding: 1rem 1rem;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const Container = styled.div`
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
`;

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  text-align: center;
  margin: 0.3rem 0 1rem 0;
  line-height: 1.4;
`;

/**
 * This is the dashboard item, and renders the item in the dashboard itself, as well as a modal if the item is expandable
 */
export const DashboardItem = ({ report }: { report: DashboardItemType }) => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { activeDashboard } = useDashboards(projectCode, entityCode, dashboardName);
  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates(report) as {
    startDate?: Moment;
    endDate?: Moment;
  };
  const { data: reportData, isLoading, isError, error, refetch } = useReport(report.reportCode, {
    projectCode,
    entityCode,
    dashboardCode: activeDashboard?.dashboardCode,
    itemCode: report.code,
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    legacy: report.legacy,
  });

  const viewContent = {
    ...report,
    ...reportData,
  };

  const { periodGranularity, type, viewType, name } = report;

  const isExpandable =
    periodGranularity || type === 'chart' || type === 'matrix' || viewType === 'dataDownload';

  return (
    <Wrapper>
      {/** render the item in the dashboard */}
      <Container>
        {name && <Title>{name}</Title>}
        <DashboardItemContent
          viewContent={viewContent}
          isLoading={isLoading}
          error={isError ? error : null}
          onRetryFetch={refetch}
          isExpandable={isExpandable}
        />
      </Container>
    </Wrapper>
  );
};
