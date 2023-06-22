/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { DashboardItemType } from '../../../types';
import { EnlargedDashboardItem } from './EnlargedDashboardItem';
import { DashboardItemContent } from './DashboarditemContent';
import { useReport } from '../../../api/queries';

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  place-content: stretch center;
  margin-bottom: 0.5rem;
  width: 100%;
  max-width: 100%;
  position: relative;
  padding: 1rem 1rem 0.6rem;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

const Container = styled.div`
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
`;

export const DashboardItem = ({ dashboardItem }: { dashboardItem: DashboardItemType }) => {
  const { projectCode, entityCode, '*': dashboardCode } = useParams();
  const { legacy, code, reportCode } = dashboardItem;
  // query for the report data
  const { data: reportData, isLoading, error, isError, refetch } = useReport(
    projectCode,
    entityCode,
    dashboardCode,
    reportCode,
    code,
    legacy,
  );

  const viewContent = {
    ...dashboardItem,
    ...reportData,
  };

  // eslint-disable-next-line react/require-default-props
  const Content = ({ isEnlarged = false }: { isEnlarged?: boolean }) => (
    <DashboardItemContent
      viewContent={viewContent}
      isEnlarged={isEnlarged}
      isLoading={isLoading}
      error={isError ? error : null}
      onRetryFetch={refetch}
    />
  );

  return (
    <Wrapper>
      {/** render the item in the dashboard */}
      <Container>
        <Content />
      </Container>
      {/** render modal for enlarged item */}
      <EnlargedDashboardItem reportCode={reportCode}>
        <Content isEnlarged />
      </EnlargedDashboardItem>
    </Wrapper>
  );
};
