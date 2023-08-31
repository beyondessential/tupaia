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
import { MultiValueViewConfig } from '@tupaia/types';
import { DashboardItemConfig, DashboardItem as DashboardItemType } from '../../types';
import { useDashboards, useReport } from '../../api/queries';
import { DashboardItemContent } from './DashboardItemContent';
import { DashboardItemContext } from './DashboardItemContext';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  place-content: stretch center;
  margin-bottom: 0.8rem;
  width: 100%;
  max-width: 100%;
  position: relative;
  padding: 0.9375rem 0.9375rem 0.9375rem 0.625rem;
  background-color: ${({ theme }) => theme.palette.background.default};
  border-radius: 0.3rem;
`;

const Container = styled.div`
  flex-flow: column nowrap;
  width: 90%;
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

const getShowDashboardItemTitle = (config: DashboardItemConfig) => {
  const { presentationOptions, type, viewType, name } = config;
  if (!name) return false;
  if (viewType === 'multiValue') {
    return (presentationOptions as MultiValueViewConfig['presentationOptions'])?.isTitleVisible;
  }
  if (viewType?.includes('Download') || type === 'component' || viewType === 'multiSingleValue')
    return false;
  return true;
};

/**
 * This is the dashboard item, and renders the item in the dashboard itself, as well as a modal if the item is expandable
 */
export const DashboardItem = ({ dashboardItem }: { dashboardItem: DashboardItemType }) => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { activeDashboard } = useDashboards(projectCode, entityCode, dashboardName);
  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates(
    dashboardItem?.config,
  ) as {
    startDate?: Moment;
    endDate?: Moment;
  };

  const { data: report, isLoading, error, refetch } = useReport(dashboardItem?.reportCode, {
    projectCode,
    entityCode,
    dashboardCode: activeDashboard?.code,
    itemCode: dashboardItem?.code,
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    legacy: dashboardItem?.legacy,
  });

  const { config = {} } = dashboardItem;

  const showTitle = getShowDashboardItemTitle(config);

  return (
    <Wrapper>
      {/** render the item in the dashboard */}
      <Container>
        <DashboardItemContext.Provider
          value={{
            config: dashboardItem?.config,
            report,
            isLoading,
            error,
            refetch,
            reportCode: dashboardItem?.reportCode,
          }}
        >
          {showTitle && <Title>{config?.name}</Title>}
          <DashboardItemContent />
        </DashboardItemContext.Provider>
      </Container>
    </Wrapper>
  );
};
