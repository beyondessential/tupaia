/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { getDefaultDates } from '@tupaia/utils';
import { DashboardCode, DashboardItemType } from '../../types';
import { useReport } from '../../api/queries';
import { EnlargedDashboardItem } from './EnlargedDashboardItem';
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

interface DashboardItemProps {
  dashboardItem: DashboardItemType;
  dashboardCode: DashboardCode;
}

/**
 * This is the dashboard item, and renders the item in the dashboard itself, as well as a modal if the item is expandable
 */
export const DashboardItem = ({ dashboardItem, dashboardCode }: DashboardItemProps) => {
  const { projectCode, entityCode } = useParams();
  const { legacy, code, reportCode, viewType, type } = dashboardItem;

  // get dates from the dashboard config, where applicable
  const { startDate, endDate } = getDefaultDates(dashboardItem) as {
    startDate?: string | null;
    endDate?: string | null;
  };
  // query for the report data
  const { data: reportData, isLoading, error, isError, refetch } = useReport(reportCode, {
    projectCode,
    entityCode,
    dashboardCode,
    itemCode: code,
    legacy,
    startDate,
    endDate,
  });

  const viewContent = {
    ...dashboardItem,
    ...reportData,
  };

  const { periodGranularity } = viewContent;

  const isExpandable =
    periodGranularity || type === 'chart' || type === 'matrix' || viewType === 'dataDownload';

  const Content = ({ isEnlarged = false }: { isEnlarged?: boolean }) => (
    <DashboardItemContent
      viewContent={viewContent}
      isEnlarged={isEnlarged}
      isLoading={isLoading}
      error={isError ? error : null}
      onRetryFetch={refetch}
      isExpandable={isExpandable && !isEnlarged}
    />
  );

  return (
    <Wrapper>
      {/** render the item in the dashboard */}
      <Container>
        <Content isEnlarged={false} />
      </Container>
      {/** render modal for enlarged item, if is expandable */}
      {isExpandable && (
        <EnlargedDashboardItem reportCode={reportCode}>
          <Content isEnlarged />
        </EnlargedDashboardItem>
      )}
    </Wrapper>
  );
};
