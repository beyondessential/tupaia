/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Typography, Button } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import { MOBILE_BREAKPOINT } from '../../constants';
import { ExpandButton } from './ExpandButton';
import { Photo } from './Photo';
import { Breadcrumbs } from './Breadcrumbs';
import { StaticMap } from './StaticMap';
import { useDashboards as useDashboardData, useEntitiesWithLocation } from '../../api/queries';
import { DashboardMenu } from './DashboardMenu';
import { DashboardItem } from '../DashboardItem';
import { DashboardItemType, DashboardType } from '../../types';

const MAX_SIDEBAR_EXPANDED_WIDTH = 1000;
const MAX_SIDEBAR_COLLAPSED_WIDTH = 500;
const MIN_SIDEBAR_WIDTH = 335;

const Panel = styled.div<{
  $isExpanded: boolean;
}>`
  position: relative;
  background-color: ${({ theme }) => theme.panel.background};
  transition: width 0.3s ease, max-width 0.3s ease;
  width: 100%;
  overflow: visible;
  min-height: 100%;
  .recharts-wrapper {
    font-size: 1rem !important;
  }
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    width: ${({ $isExpanded }) =>
      $isExpanded
        ? 50
        : 25}%; // setting this to 100% when expanded takes up approx 50% of the screen, because the map is also set to 100%
    height: 100%;
    min-width: ${MIN_SIDEBAR_WIDTH}px;
    max-width: ${({ $isExpanded }) =>
      $isExpanded ? MAX_SIDEBAR_EXPANDED_WIDTH : MAX_SIDEBAR_COLLAPSED_WIDTH}px;
  }
`;

const ScrollBody = styled.div`
  position: relative;
  height: 100%;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    overflow: auto;
  }
`;

const TitleBar = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.panel.background};
  z-index: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const ExportButton = styled(Button).attrs({
  variant: 'outlined',
})`
  font-size: 0.6875rem;
`;

const Title = styled(Typography)`
  color: white;
  font-weight: 400;
  font-size: 1.625rem;
  line-height: 1.4;
`;

const DashboardItemsWrapper = styled.div<{
  $isExpanded: boolean;
}>`
  display: ${({ $isExpanded }) =>
    $isExpanded
      ? 'grid'
      : 'block'}; // when in a column, the items should be stacked vertically. Setting to display: block fixes and issue with the chart not contracting to the correct width
  background-color: ${({ theme }) => theme.panel.secondaryBackground};
  grid-template-columns: repeat(2, 1fr);
  column-gap: 0.5rem;
`;

const DashboardImageContainer = styled.div`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const useDashboards = () => {
  const { projectCode, entityCode, dashboardName } = useParams();
  const { data: dashboards = [] } = useDashboardData(projectCode, entityCode);

  let activeDashboard = null;

  if (dashboards.length > 0) {
    activeDashboard =
      dashboards.find((dashboard: DashboardType) => dashboard.name === dashboardName) ||
      dashboards[0];
  }

  return { dashboards, activeDashboard };
};

export const Dashboard = () => {
  const { projectCode, entityCode } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const { dashboards, activeDashboard } = useDashboards();
  const { data: entityData } = useEntitiesWithLocation(projectCode, entityCode);
  const bounds = entityData?.bounds;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Panel $isExpanded={isExpanded}>
      <ExpandButton setIsExpanded={toggleExpanded} isExpanded={isExpanded} />
      <ScrollBody>
        <Breadcrumbs />
        <DashboardImageContainer>
          {bounds ? (
            <StaticMap polygonBounds={bounds} />
          ) : (
            <Photo title={entityData?.name} photoUrl={entityData?.photoUrl} />
          )}
        </DashboardImageContainer>
        <TitleBar>
          <Title variant="h3">{entityData?.name}</Title>
          <ExportButton startIcon={<GetAppIcon />}>Export</ExportButton>
        </TitleBar>
        <DashboardMenu activeDashboard={activeDashboard} dashboards={dashboards} />
        <DashboardItemsWrapper $isExpanded={isExpanded}>
          {activeDashboard?.items.map((dashboardItem: DashboardItemType) => (
            <DashboardItem
              key={dashboardItem.code}
              dashboardItem={dashboardItem}
              dashboardCode={activeDashboard?.code}
            />
          ))}
        </DashboardItemsWrapper>
      </ScrollBody>
    </Panel>
  );
};
