import React from 'react';
import styled from 'styled-components';
import { Moment } from 'moment';
import { useParams } from 'react-router';
import { Typography } from '@material-ui/core';
import { getDefaultDates } from '@tupaia/utils';
import { DashboardItemConfig, DashboardItemType } from '@tupaia/types';
import { DashboardItem as DashboardItemT } from '../../types';
import { useReport } from '../../api/queries';
import { useDashboard } from '../Dashboard';
import { DashboardItemContent } from './DashboardItemContent';
import { DashboardItemContext } from './DashboardItemContext';

const Wrapper = styled.div`
  align-items: stretch;
  background-color: ${({ theme }) => theme.palette.background.default};
  border-radius: 0.3rem;
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 0.8rem;
  max-width: 100%;
  padding: 0.9375rem 0.9375rem 0.9375rem 0.625rem;
  place-content: stretch center;
  position: relative;
  width: 100%;
  svg.recharts-surface {
    overflow: visible;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  line-height: 1.4;
  margin-block: 0.2rem 1rem;
  margin-inline: 0;
  text-align: center;
`;

const getShowDashboardItemTitle = (config?: DashboardItemConfig, legacy?: boolean) => {
  if (!config) return false;
  const { type, name } = config;
  if (!name) return false;
  if (type === 'component') return false;
  if (type === 'view') {
    const { viewType } = config;
    if (
      viewType === 'multiValue' &&
      'presentationOptions' in config &&
      config.presentationOptions
    ) {
      const { presentationOptions } = config;
      // if report is legacy, show title because it won't have the config set
      return presentationOptions?.isTitleVisible || legacy;
    }
    if (viewType?.includes('Download') || viewType === 'multiSingleValue') return false;
  }

  return true;
};

/**
 * This is the dashboard item, and renders the item in the dashboard itself, as well as a modal if the item is expandable
 */
export const DashboardItem = ({ dashboardItem }: { dashboardItem: DashboardItemT }) => {
  const { projectCode, entityCode } = useParams();
  const { activeDashboard } = useDashboard();
  const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDates(
    dashboardItem?.config,
  ) as {
    startDate?: Moment;
    endDate?: Moment;
  };

  const type = dashboardItem?.config?.type;

  const isEnabled = type !== DashboardItemType.Matrix; // don't fetch the report if the item is a matrix, because we only view the matrix in the modal

  const {
    data: report,
    isInitialLoading: isLoading,
    error,
    refetch,
  } = useReport(
    dashboardItem?.reportCode,
    {
      projectCode,
      entityCode,
      dashboardCode: activeDashboard?.code,
      itemCode: dashboardItem?.code,
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      legacy: dashboardItem?.legacy,
    },
    isEnabled, // don't fetch the report if the item is a matrix, because we only view the matrix in the modal
  );

  const { config, legacy } = dashboardItem;

  const showTitle = getShowDashboardItemTitle(config, legacy);

  return (
    <Wrapper>
      {/* Render the item in the dashboard */}
      <DashboardItemContext.Provider
        value={{
          config: dashboardItem?.config,
          report,
          isLoading: isEnabled && isLoading,
          isEnabled,
          error,
          refetch,
          reportCode: dashboardItem?.reportCode,
        }}
      >
        {showTitle && <Title>{config?.name}</Title>}
        <DashboardItemContent />
      </DashboardItemContext.Provider>
    </Wrapper>
  );
};
