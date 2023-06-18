/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Typography, Button } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import { ExpandButton } from './ExpandButton';
import { Photo } from './Photo';
import { Breadcrumbs } from './Breadcrumbs';
import { StaticMap } from './StaticMap';
import { useDashboards, useEntity } from '../../api/queries';
import { DashboardMenu } from './DashboardMenu';

const MAX_SIDEBAR_EXPANDED_WIDTH = 1000;
const MAX_SIDEBAR_COLLAPSED_WIDTH = 500;
const MIN_SIDEBAR_WIDTH = 335;

const Panel = styled.div<{
  $isExpanded: boolean;
}>`
  position: relative;
  background-color: ${({ theme }) => theme.panel.background};
  transition: width 0.5s ease, max-width 0.5s ease;
  width: ${({ $isExpanded }) => ($isExpanded ? 55 : 30)}%;
  min-width: ${MIN_SIDEBAR_WIDTH}px;
  max-width: ${({ $isExpanded }) =>
    $isExpanded ? MAX_SIDEBAR_EXPANDED_WIDTH : MAX_SIDEBAR_COLLAPSED_WIDTH}px;
  overflow: visible;
`;

const ScrollBody = styled.div`
  position: relative;
  height: 100%;
  overflow: auto;
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

const ChartsContainer = styled.div<{
  $isExpanded: boolean;
}>`
  display: grid;
  background-color: ${({ theme }) => theme.panel.secondaryBackground};
  grid-template-columns: repeat(auto-fill, minmax(${MIN_SIDEBAR_WIDTH}px, auto));
  column-gap: 0.5rem;
  row-gap: 0.5rem;
  padding: ${({ $isExpanded }) => ($isExpanded ? '0 0.5rem 0.5rem' : '0 0 0.5rem 0')};
`;

const Chart = styled.div`
  position: relative;
  text-align: center;
  background-color: ${({ theme }) => theme.panel.background};
  // Use padding to maintain aspect ratio
  padding: 1rem 1rem 75%;
`;

export const Sidebar = () => {
  const { projectCode, entityCode, '*': dashboardCode } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: entityData } = useEntity(entityCode);
  const bounds = entityData?.location?.bounds;

  const { data: dashboardData } = useDashboards(projectCode, entityCode);
  const activeDashboard = dashboardData?.find(dashboard => dashboard.code === dashboardCode);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Panel $isExpanded={isExpanded}>
      <ExpandButton setIsExpanded={toggleExpanded} isExpanded={isExpanded} />
      <ScrollBody>
        <Breadcrumbs />
        {bounds ? (
          <StaticMap polygonBounds={bounds} />
        ) : (
          <Photo title={entityData?.name} photoUrl={entityData?.photoUrl} />
        )}
        <TitleBar>
          <Title variant="h3">{entityData?.name}</Title>
          <ExportButton startIcon={<GetAppIcon />}>Export</ExportButton>
        </TitleBar>
        <DashboardMenu />
        <ChartsContainer $isExpanded={isExpanded}>
          {activeDashboard?.items.map(({ childId }) => {
            return <Chart key={childId}>DashboardId: {childId}</Chart>;
          })}
        </ChartsContainer>
      </ScrollBody>
    </Panel>
  );
};
