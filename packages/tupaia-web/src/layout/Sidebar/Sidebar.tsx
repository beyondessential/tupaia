/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Typography, Button } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import { TRANSPARENT_BLACK, PANEL_GREY } from '../../constants';
import { ExpandButton } from './ExpandButton';
import { Photo } from './Photo';
import { Breadcrumbs } from './Breadcrumbs';
import { StaticMap } from './StaticMap';
import { useDashboards, useEntity } from '../../api/queries';
import { DashboardDropdown } from './DashboardDropdown.tsx';
import { DashboardCode, EntityCode, ProjectCode } from '../../types';

const MAX_SIDEBAR_EXPANDED_WIDTH = 1000;
const MAX_SIDEBAR_COLLAPSED_WIDTH = 500;
const MIN_SIDEBAR_WIDTH = 335;

const Panel = styled.div<{
  $isExpanded: boolean;
}>`
  position: relative;
  background-color: ${TRANSPARENT_BLACK};
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
  background-color: ${TRANSPARENT_BLACK};
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
  background-color: ${PANEL_GREY};
  grid-template-columns: repeat(auto-fill, minmax(${MIN_SIDEBAR_WIDTH}px, auto));
  column-gap: 0.5rem;
  row-gap: 0.5rem;
  padding: ${({ $isExpanded }) => ($isExpanded ? '0 0.5rem 0.5rem' : '0 0 0.5rem 0')};
`;

const Chart = styled.div`
  position: relative;
  text-align: center;
  background-color: ${TRANSPARENT_BLACK};
  // Use padding to maintain aspect ratio
  padding: 1rem 1rem 75%;
`;

const useDashboardDropdown = (projectCode?: ProjectCode, entityCode?: EntityCode) => {
  const { data: dashboardData, isLoading } = useDashboards(projectCode, entityCode);
  const [selectedDashboardCode, setSelectedDashboardCode] = useState<null | DashboardCode>(null);

  const dashboardOptions = dashboardData?.map(({ code, name }) => ({ value: code, label: name }));

  const onChangeDashboard = (code: DashboardCode) => {
    setSelectedDashboardCode(code);
  };

  const activeDashboard = dashboardData?.find(
    dashboard => dashboard.code === selectedDashboardCode,
  );

  return { isLoading, dashboardOptions, onChangeDashboard, activeDashboard, selectedDashboardCode };
};

export const Sidebar = () => {
  const { projectCode, entityCode } = useParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: entityData } = useEntity(entityCode);
  const {
    dashboardOptions,
    onChangeDashboard,
    activeDashboard,
    selectedDashboardCode,
  } = useDashboardDropdown(projectCode, entityCode);
  const bounds = entityData?.location?.bounds;

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
          <Title variant="h3">Northern</Title>
          <ExportButton startIcon={<GetAppIcon />}>Export</ExportButton>
        </TitleBar>
        <DashboardDropdown
          options={dashboardOptions}
          value={selectedDashboardCode}
          onChange={onChangeDashboard}
        />
        <ChartsContainer $isExpanded={isExpanded}>
          {activeDashboard?.items.map(({ childId }) => {
            return <Chart key={childId}>DashboardId: {childId}</Chart>;
          })}
        </ChartsContainer>
      </ScrollBody>
    </Panel>
  );
};
